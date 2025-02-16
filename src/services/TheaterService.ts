import { DeepPartial } from "typeorm";
import { Theater } from "../entitys/Theater";
import BaseService from "../utils/BaseService";
import { TheaterFilter, TypeSort } from "../models/modelRequest/FilterModel";
import CustomError from "../utils/CustumError";
import { TheaterModel } from "models/modelRequest/TheaterModel";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";

export default class TheaterService extends BaseService<Theater> {
  constructor() {
    super(Theater, "theater");
  }
  protected async isNotFound(id: number): Promise<Theater> {
    const data = await (await this.repository.getBy(id)).getOne();
    if (data) {
      return data;
    }
    throw new CustomError(`Rạp chiếu phim này không tồn tại`, 404);
  }
  async getFilter(filter: TheaterFilter) {
    const { city, address, orderBy, sort, page, pageSize, name } = filter;
    let queryBuilder = await this.repository.createQueryBuilder();
    if (city) {
      queryBuilder = queryBuilder.andWhere("theater.city = :city", { city });
    }
    if (address) {
      queryBuilder = queryBuilder.andWhere("theater.address LIKE :address", {
        address: `%${address}%`,
      });
    }
    if (name) {
      queryBuilder = queryBuilder.andWhere("theater.name LIKE:name", {
        name: `%${name}%`,
      });
    }
    if (orderBy) {
      queryBuilder = queryBuilder.orderBy(
        `theater.${orderBy}`,
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
  protected async isUnique(name: string) {
    const record = await (await this.repository.getBy(name, "name")).getOne();
    if (record) {
      return record;
    }
  }
  protected async validate(id: number, data: DeepPartial<Theater>) {
    // Kiểm tra sự tồn tại của bản ghi
    if (id) await this.isNotFound(id);
    // Kiểm tra tên rạp chiếu có trùng hay không
    const record = await this.isUnique(data.name);
    // Nếu record là null (tức là không có bản ghi nào), kiểm tra tên rạp chiếu
    if (record && record.id != id) {
      throw new CustomError(
        `Tên rạp chiếu phim ${data.name} đã tồn tại`,
        400,
        "name"
      );
    }
  }
  async createArray(datas: TheaterModel[]): Promise<void> {
    const dataUnique = datas.map((data) => ({
      name: data.name.toLowerCase().trim(),
    }));
    if (IsDuplicatesWithSort(dataUnique)) {
      throw new CustomError(`Có tên bị trùng trong dữ liệu đầu vào`, 400);
    }
    await super.createArray(datas);
  }
}
