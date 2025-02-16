import {
  DeepPartial,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from "typeorm";
import { EntityTarget, EntityManager } from "typeorm";
import dataSource from "../DataSource";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export interface IRelationship {
  original: string;
  link: string;
}

export interface IPagination<T> {
  records: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
export default class BaseRepository<T extends ObjectLiteral> {
  protected alias: string;
  protected entity: EntityTarget<T>;
  constructor(entity: EntityTarget<T>, alias) {
    this.entity = entity;
    this.alias = alias;
  }

  getRepository(transactionalEntityManager?: EntityManager): Repository<T> {
    return transactionalEntityManager
      ? transactionalEntityManager.getRepository(this.entity)
      : dataSource.getRepository(this.entity);
  }
  // Create a query builder
  async createQueryBuilder(
    transactionalEntityManager?: EntityManager
  ): Promise<SelectQueryBuilder<T>> {
    const repository = this.getRepository(transactionalEntityManager);
    return repository.createQueryBuilder(this.alias);
  }
  // Fetch records by an array of values
  async getByArray(
    values: unknown[],
    columnField: string = "id",
    transactionalEntityManager?: EntityManager
  ): Promise<T[]> {
    if (!values.length) return [];
    const queryBuilder = await this.createQueryBuilder(
      transactionalEntityManager
    );
    queryBuilder.where(`${this.alias}.${columnField} IN (:...values)`, {
      values,
    });
    return queryBuilder.getMany();
  }
  // Pagination utility
  async getPagination(
    queryBuilder: SelectQueryBuilder<T>,
    page: number = 1,
    pageSize: number = 10
  ): Promise<IPagination<T>> {
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);
    const [records, total] = await queryBuilder.getManyAndCount();
    return {
      records,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // Lấy một đối tượng theo ID
  async getBy(
    value: unknown,
    columnField: string = "id",
    transactionalEntityManager?: EntityManager
  ): Promise<SelectQueryBuilder<T>> {
    const repository = this.getRepository(transactionalEntityManager);
    const queryBuilder = repository.createQueryBuilder(this.alias);
    queryBuilder.where(`${this.alias}.${columnField} = :value`, { value });
    return queryBuilder.limit(1);
  }
  // Tạo mới một đối tượng
  async create(
    data: DeepPartial<T>,
    transactionalEntityManager?: EntityManager
  ): Promise<T> {
    const repository = this.getRepository(transactionalEntityManager);
    const newRecord = repository.create(data);
    return repository.save(newRecord);
  }
  // Create multiple records
  async createArray(
    data: DeepPartial<T>[],
    transactionalEntityManager: EntityManager
  ) {
    if (!data.length) return;
    return await transactionalEntityManager
      .createQueryBuilder()
      .insert()
      .into(this.entity)
      .values(data as QueryDeepPartialEntity<T>)
      .execute();
  }

  // Update a single record
  async update(
    id: number,
    data: DeepPartial<T>,
    transactionalEntityManager?: EntityManager
  ): Promise<void> {
    const repository = this.getRepository(transactionalEntityManager);
    await repository.update(id, data as QueryDeepPartialEntity<T>);
  }

  // Delete a single record
  async remove(
    record: T,
    transactionalEntityManager?: EntityManager
  ): Promise<void> {
    const repository = this.getRepository(transactionalEntityManager);
    await repository.remove(record);
  }

  // Xóa nhiều bản ghi
  async removeArray(
    ids: number[],
    transactionalEntityManager: EntityManager
  ): Promise<void> {
    if (!ids.length) return;
    await transactionalEntityManager
      .createQueryBuilder()
      .delete()
      .from(this.entity)
      .whereInIds(ids)
      .execute();
  }
}
