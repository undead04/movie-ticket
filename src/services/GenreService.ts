import { DeepPartial } from "typeorm";
import { Genre } from "../entitys/Genre";
import BaseService from "../utils/BaseService";
import { GenreFilter, TypeSort } from "../models/modelRequest/FilterModel";
import { IPagination } from "../utils/BaseRepository";
import CustomError from "../utils/CustumError";
import { GenreModel } from "models/modelRequest/GenreModel";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";

export default class GenreService extends BaseService<Genre> {
  constructor() {
    super(Genre, "genre");
  }
  protected async isNotFound(id: number): Promise<Genre> {
    const genre = await (await this.repository.getBy(id)).getOne();
    if (genre) {
      return genre;
    }
    throw new CustomError("Thể loại phim này không tồn tại", 404);
  }
  async getFilter(filter?: GenreFilter): Promise<IPagination<Genre>> {
    const { name, orderBy, sort, page, pageSize } = filter;
    const queryBuilder = await this.repository.createQueryBuilder();
    if (name) {
      // Đảm bảo truyền giá trị name vào một cách an toàn
      queryBuilder.andWhere("genre.name like :name", { name: `%${name}%` });
    }
    if (orderBy) {
      queryBuilder.orderBy(
        `genre.${orderBy}`,
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
    const genre = await (await this.repository.getBy(name, "name")).getOne();
    if (genre) {
      return genre;
    }
  }
  protected async validate(id: number, data: DeepPartial<Genre>) {
    // Kiểm tra sự tồn tại của bản ghi
    if (id) await this.isNotFound(id);
    // Kiểm tra tên thể loại có trùng hay không
    const record = await this.isUnique(data.name);
    if (record && record.id !== id) {
      throw new CustomError(
        `Tên thể loại phim ${data.name} đã tồn tại`,
        400,
        "name"
      );
    }
  }
  async createArray(datas: GenreModel[]): Promise<void> {
    const dataUnique = datas.map((data) => ({
      name: data.name.toLowerCase().trim(),
    }));
    if (IsDuplicatesWithSort(dataUnique)) {
      throw new CustomError(`Có tên bị trùng trong dữ liệu đầu vào`, 400);
    }
    await super.createArray(datas);
  }
}
