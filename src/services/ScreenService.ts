import { DeepPartial } from "typeorm";
import { Screen } from "../entitys/Screen";
import { Theater } from "../entitys/Theater";
import BaseService from "../utils/BaseService";
import BaseRepository from "../utils/BaseRepository";
import { ScreenFilter, TypeSort } from "../models/modelRequest/FilterModel";
import CustomError from "../utils/CustumError";
import { plainToInstance } from "class-transformer";
import { ScreenDTO } from "../models/modelResponse/ScreenResponse";

export default class ScreenServie extends BaseService<Screen> {
  protected theaterRepository: BaseRepository<Theater>;
  constructor() {
    super(Screen, "screen");
    this.theaterRepository = new BaseRepository(Theater, "theater");
  }
  protected transformDTO(data: DeepPartial<Screen>) {
    return plainToInstance(ScreenDTO, data);
  }
  protected async isNotFound(id: number) {
    const queryBuilder = (await this.repository.getBy(id)).leftJoinAndSelect(
      "screen.theater",
      "theater"
    );
    queryBuilder.select([
      "screen.id",
      "screen.name",
      "theater.id",
      "theater.name",
      "theater.address",
      "screen.seatCapacity",
    ]);
    const data = await queryBuilder.getOne();
    if (data) {
      return data;
    }
    throw new CustomError("Phòng chiếu phim này không tồn tại", 404);
  }
  async getFilter(filter: ScreenFilter) {
    const { theaterId, orderBy, sort, page, pageSize } = filter;
    let queryBuilder = await (
      await this.repository.createQueryBuilder()
    ).leftJoinAndSelect("screen.theater", "theater");
    if (theaterId) {
      queryBuilder = queryBuilder.where("screen.theaterId =:theaterId", {
        theaterId,
      });
    }
    if (orderBy) {
      queryBuilder = queryBuilder.orderBy(
        `screen.${orderBy}`,
        sort == TypeSort.ASC ? "ASC" : "DESC"
      );
    }
    queryBuilder.select([
      "screen.id",
      "screen.name",
      "theater.id",
      "theater.name",
      "theater.address",
      "screen.seatCapacity",
    ]);
    const data = await this.repository.getPagination(
      queryBuilder,
      page,
      pageSize
    );
    return data;
  }
  protected async IsUnique(name: string, theaterId: number) {
    const record = await (await this.repository.getBy(name, "name"))
      .andWhere("screen.theaterId =:theaterId", { theaterId })
      .getOne();
    if (record) {
      return record;
    }
  }
  protected async validateTheater(id: number) {
    const record = await (await this.theaterRepository.getBy(id)).getOne();
    if (record == null) {
      throw new CustomError(`Không tìm thấy rạp chiếu phim có id = ${id}`, 404);
    }
    return record;
  }
  protected async validate(id: number, data: DeepPartial<Screen>) {
    if (id) await this.isNotFound(id);
    const recordTheater = await this.validateTheater(data.theater.id);
    // Kiểm tra tên thể loại có trùng hay không
    const record = await this.IsUnique(data.name, data.theater.id);
    // Nếu record là null (tức là không có bản ghi nào), kiểm tra tên thể loại
    if (record && record.id !== id) {
      throw new CustomError(
        `Tên của căn phòng ${data.name} đã tồn tại trong rạp ${recordTheater.name}`,
        400,
        "name"
      );
    }
  }
}
