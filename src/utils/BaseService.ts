import dataSource from "../DataSource";
import BaseRepository from "./BaseRepository";
import { DeepPartial, EntityTarget, ObjectLiteral } from "typeorm";

export default abstract class BaseService<T extends ObjectLiteral> {
  protected repository: BaseRepository<T>;
  constructor(entity: EntityTarget<T>, alias: string) {
    this.repository = new BaseRepository<T>(entity, alias);
  }
  protected abstract validate(id: number, data: DeepPartial<T>): Promise<void>;
  protected abstract isNotFound(id: number): Promise<T>;
  // Tạo mới một đối tượng
  async create(data: any): Promise<T | void> {
    await this.validate(0, data);
    return this.repository.create(data);
  }
  async createArray(datas: any[]): Promise<void> {
    await Promise.all(datas.map(async (data) => await this.validate(0, data)));
    await dataSource.manager.transaction(async (entityManager) => {
      await this.repository.createArray(datas, entityManager);
    });
  }
  // Lấy một đối tượng theo ID
  async getById(value: number): Promise<T | null> {
    const records = await this.isNotFound(value);
    return records;
  }

  // Cập nhật một đối tượng
  async update(id: number, data: any): Promise<void> {
    await this.validate(id, data);
    return this.repository.update(id, data);
  }

  // Xóa một đối tượng
  async remove(id: number): Promise<void> {
    const record = await this.isNotFound(id);
    return this.repository.remove(record);
  }

  async removeArray(ids: number[]): Promise<void> {
    await dataSource.manager.transaction(async (transactionEntityManager) => {
      await this.repository.removeArray(ids, transactionEntityManager);
    });
  }
}
