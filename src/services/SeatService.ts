import { DeepPartial } from "typeorm";
import { Seat } from "../entitys/Seat";
import { Screen } from "../entitys/Screen";
import { Ticket } from "../entitys/Ticket";
import { Showtime } from "../entitys/Showtime";
import BaseService from "../utils/BaseService";
import BaseRepository from "../utils/BaseRepository";
import CustomError from "../utils/CustumError";
import { SeatFilter, TypeSort } from "../models/modelRequest/FilterModel";
import { SeatModel } from "../models/modelRequest/SeatModel";

export default class SeatService extends BaseService<Seat> {
  protected screenRepository: BaseRepository<Screen>;
  protected ticketRepository: BaseRepository<Ticket>;
  protected showtimeRepository: BaseRepository<Showtime>;
  constructor() {
    super(Seat, "seat");
    this.screenRepository = new BaseRepository(Screen, "screen");
    this.ticketRepository = new BaseRepository(Ticket, "ticket");
    this.showtimeRepository = new BaseRepository(Showtime, "showtime");
  }
  protected async isNotFound(id: number): Promise<Seat> {
    const data = await (await this.repository.getBy(id))
      .leftJoinAndSelect("seat.screen", "screen")
      .select([
        "seat.id",
        "seat.row",
        "seat.col",
        "seat.seatNumber",
        "screen.id",
        "screen.name",
      ])
      .getOne();
    if (data) {
      return data;
    }
    throw new CustomError(`Ghế này không tồn tại có id = ${id}`, 404);
  }
  async getSeatStatus(showtimeId: number) {
    const showtimeRecord = (
      await await this.showtimeRepository.getBy(showtimeId)
    ).getOne();
    if (showtimeRecord == null) {
      throw new CustomError(
        `thời gian chiếu phim có id = ${showtimeId} không tồn tại`,
        404
      );
    }
    const seatStatus = await (
      await this.repository.createQueryBuilder()
    )
      .leftJoinAndSelect(
        "seat.tickets",
        "ticket",
        "ticket.seatId = seat.id AND ticket.showtimeId = :showtimeId",
        { showtimeId }
      )
      .leftJoinAndSelect(
        "ticket.bill",
        "bill",
        "bill.id = ticket.billId AND bill.statusOrder = 2"
      )
      .leftJoin("seat.screen", "screen")
      .leftJoin("screen.showtimes", "showtime")
      .select([
        "seat.*",
        `CASE 
                WHEN ticket.id IS NULL OR bill.id IS NULL THEN false
                ELSE true
            END AS status`,
      ])
      .andWhere("showtime.id =:showtimeId", { showtimeId })
      .getRawMany();
    return seatStatus;
  }
  async getFilter(filter: SeatFilter) {
    const { seatNumber, screenId, page, pageSize, sort, orderBy } = filter;
    let queryBuilder = (
      await this.repository.createQueryBuilder()
    ).leftJoinAndSelect("seat.screen", "screen");
    if (seatNumber) {
      queryBuilder = queryBuilder.andWhere("seat.seatNumber LIKE :seatNumber", {
        seatNumber: `%${seatNumber}%`,
      });
    }
    if (screenId) {
      queryBuilder = queryBuilder.andWhere("seat.screenId = :screenId", {
        screenId,
      });
    }
    if (orderBy) {
      queryBuilder = queryBuilder.orderBy(
        `seat.${orderBy}`,
        sort == TypeSort.ASC ? "ASC" : "DESC"
      );
    }
    const data = await this.repository.getPagination(
      queryBuilder,
      page,
      pageSize
    );
    return data;
  }
  protected async isUnique(model: DeepPartial<Seat>) {
    const record = await (await this.repository.createQueryBuilder())
      .andWhere("seat.row = :row", { row: model.row })
      .andWhere("seat.col = :col", { col: model.col })
      .andWhere("seat.screenId = :screenId", { screenId: model.screen?.id })
      .getOne();
    if (record) return record; // Trả về true nếu record tồn tại, ngược lại trả về false
  }
  protected async validateScreen(id: number): Promise<Screen> {
    const data = await (await this.screenRepository.getBy(id)).getOne();
    if (data == null) {
      throw new CustomError(
        `Không tìm thấy phòng chiếu phim có id =${id}`,
        400,
        "screenId"
      );
    }
    return data;
  }
  protected async limitSeat(screenId: number, modelCount: number) {
    const recordScreen = await this.validateScreen(screenId);
    const recordSeatCout = await (
      await this.repository.getBy(screenId, "screenId")
    ).getCount();
    if (recordSeatCout + modelCount > recordScreen.seatCapacity) {
      throw new CustomError(
        `không thể thêm vì vượt quá mướt cho phép của phòng chiếu phim ${recordScreen.name} và hiện tại số ghế là ${recordSeatCout}`,
        400
      );
    }
  }
  protected async validate(
    id: number,
    model: DeepPartial<Seat>
  ): Promise<void> {
    const recordScreen = await this.validateScreen(model.screen.id);
    if (id) await this.isNotFound(id);
    const record = await this.isUnique(model);
    if (record && record.id !== id) {
      throw new CustomError(
        `Vị trí ghế row: ${model.row} col: ${model.col} đã tồn tại trong phòng chiếu phim ${recordScreen.name}`,
        400,
        "row"
      );
    }
  }
  async create(data: SeatModel): Promise<void | Seat> {
    await this.limitSeat(data.screenId, 1);
    await this.validate(0, data);
    await super.create(data);
  }
}
