import { DeepPartial } from "typeorm";
import { Bill, StatusOrder } from "../entitys/Bill";
import AppRole from "../models/modelRequest/AppRole";
import { Seat } from "../entitys/Seat";
import { Showtime } from "../entitys/Showtime";
import { Ticket } from "../entitys/Ticket";
import BaseRepository from "../utils/BaseRepository";
import BaseService from "../utils/BaseService";
import { BillFilter, TypeSort } from "../models/modelRequest/FilterModel";
import CustomError from "utils/CustumError";
import { IPaymentModel, PaymentModel } from "models/modelRequest/PaymentModel";
import dataSource from "DataSource";
import { generateOrderId } from "utils/GenerationCode";

export default class BillService extends BaseService<Bill> {
  protected seatRepository: BaseRepository<Seat>;
  protected showtimeRepository: BaseRepository<Showtime>;
  protected ticketRepository: BaseRepository<Ticket>;
  constructor() {
    super(Bill, "bill");
    this.seatRepository = new BaseRepository(Seat, "seat");
    this.showtimeRepository = new BaseRepository(Showtime, "showtime");
    this.ticketRepository = new BaseRepository(Ticket, "ticket");
  }
  protected async validate(id: number, data: IPaymentModel): Promise<void> {
    const nowDate = Date.now();
    // Tạo một đối tượng Date từ timestamp
    const dateObject = new Date(nowDate);
    if (id) await this.isNotFound(id);

    // xem thử có tồn tại showtimeId không
    const showtimeData = await (
      await this.showtimeRepository.getBy(data.showtimeId)
    )
      .innerJoinAndSelect("showtime.screen", "screen")
      .getOne();
    if (showtimeData == null) {
      throw new CustomError(
        `Không tồn tại thời gian chiếu phim này có id = ${data.showtimeId}`,
        400,
        "showtimeId"
      );
    }
    // Tìm thử có ghế ở trong phòng không
    for (const seatId of data.seatIds) {
      const seatData = await (
        await this.seatRepository.createQueryBuilder()
      )
        .andWhere("seat.screenId = :screenId", {
          screenId: showtimeData.screen.id,
        })
        .andWhere("seat.id = :seatId", { seatId: seatId })
        .getOne();
      if (seatData == null) {
        throw new CustomError(
          `Không tìm thấy ghế có id = ${seatId} ở phòng chiếu phim có id = ${showtimeData.screen.id}`,
          400,
          "seatIds"
        );
      }
    }
    if (
      new Date(dateObject) >
      new Date(`${showtimeData.showDate}T${showtimeData.startTime}`)
    ) {
      throw new CustomError(
        "Không thể mua vé xem phim này vì đã hết hạn",
        400,
        "showtimeId"
      );
    }
    const record = await this.isUnique(data);
    if (record && record.id !== id) {
      throw new CustomError(`vế xem phim này đã được mua rồi`, 400, "seatIds");
    }
  }
  protected async isNotFound(id: number): Promise<Bill> {
    const data = await (await this.repository.getBy(id)).getOne();
    if (data == null) {
      throw new CustomError("Không tìm thấy hóa đơn này", 404);
    }
    return data;
  }
  async getBillCode(orderCode: string): Promise<Bill> {
    return (await this.repository.getBy(orderCode, "orderCode"))
      .innerJoinAndSelect("bill.user", "user")
      .innerJoinAndSelect("bill.tickets", "ticket")
      .innerJoinAndSelect("ticket.seat", "seat")
      .innerJoinAndSelect("ticket.showtime", "showtime")
      .innerJoinAndSelect("showtime.movie", "movie")
      .innerJoinAndSelect("showtime.screen", "screen")
      .innerJoinAndSelect("screen.theater", "theater")
      .getOne();
  }
  async getFilter(filter: BillFilter) {
    const {
      orderCode,
      statusOrder,
      role,
      userId,
      from,
      to,
      sort,
      orderBy,
      page,
      pageSize,
    } = filter;
    let queryBuilder = await (
      await this.repository.createQueryBuilder()
    ).leftJoinAndSelect("bill.user", "user");
    if (role == AppRole.User) {
      queryBuilder = queryBuilder
        .andWhere("bill.userId =:userId", { userId: userId })
        .andWhere("bill.statusOrder =:statusComplete", {
          statusComplete: StatusOrder.complete,
        });
    }
    if (orderCode) {
      queryBuilder = queryBuilder.andWhere("bill.orderCode=:orderCode", {
        orderCode,
      });
    }
    if (statusOrder) {
      queryBuilder = queryBuilder.andWhere("bill.statusOrder=:statusOrder", {
        statusOrder,
      });
    }
    if (from) {
      queryBuilder = queryBuilder.andWhere("bill.bookingTime >=: from", {
        from,
      });
    }
    if (to) {
      queryBuilder = queryBuilder.andWhere("bill.bookingTime<=:to", { to });
    }
    if (orderBy) {
      queryBuilder = queryBuilder.orderBy(
        `bill.${orderBy}`,
        sort == TypeSort.ASC ? "ASC" : "DESC"
      );
    }
    queryBuilder = queryBuilder.select([
      "bill.id",
      "bill.orderCode",
      "bill.totalPrice",
      "bill.statusOrder",
      "bill.bookingTime",
      "bill.paymentMethod",
      "user.id",
      "user.username",
    ]);
    const data = await this.repository.getPagination(
      queryBuilder,
      page,
      pageSize
    );
    return data;
  }
  protected async isUnique(model: IPaymentModel) {
    const data = (await this.repository.createQueryBuilder())
      .leftJoin("bill.tickets", "ticket")
      .andWhere("ticket.showtimeId=:showtimeId", {
        showtimeId: model.showtimeId,
      })
      .andWhere("ticket.seatId IN (:...seatId)", { seatId: model.seatIds })
      .andWhere("bill.statusOrder != :statusOrder", {
        statusOrder: StatusOrder.expired,
      })
      .getOne();
    return data;
  }
  async create(data: IPaymentModel): Promise<Bill> {
    await this.validate(0, data);
    let bill;
    await dataSource.transaction(async (entityManager) => {
      const showtimeData = await (
        await this.showtimeRepository.getBy(data.showtimeId)
      ).getOne();
      const totalPrice = showtimeData.price * data.seatIds.length;
      bill = await this.repository.create(
        {
          ...data,
          user: { id: data.userId },
          expiration_time: new Date(Date.now() + 60 * 1000 * 10),
          totalPrice,
          orderCode: generateOrderId(),
        },
        entityManager
      );
      const ticketModels = data.seatIds.map((seatId) => ({
        seat: { id: seatId },
        showtime: { id: data.showtimeId },
        bill: { id: bill.id },
      }));
      await this.ticketRepository.createArray(ticketModels, entityManager);
    });
    return bill;
  }
  async updateStatusBill(orderCode: string, status: StatusOrder) {
    const data = await this.getBillCode(orderCode);
    this.repository.update(data.id, { statusOrder: status });
  }
}
