import {
  DeepPartial,
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder
} from 'typeorm';
import dataSource from '../DataSource'; // Assuming dataSource is configured correctly
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import CustomError from '../validations/CustumError';

interface IRelationship {
  original: string;
  link: string;
}

interface IPagination<T> {
  records: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Abstract base service
export default  class DataService<T extends ObjectLiteral> {
  protected alias: string;
  protected entity: EntityTarget<T>;
  constructor(entity:EntityTarget<T>,alias){
    this.entity=entity;
    this.alias=alias;
  }

  // Helper method to get the repository
  protected getRepository(transactionalEntityManager?: EntityManager): Repository<T> {
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
  async isNotFound(id:number,message:string,statusCode:number=404,field?:string){
    const record = await this.getBy(id)
    if(record==null){
        throw new CustomError(message,statusCode,field)
    }
    return record    
    }
  // Fetch all records
  async getAll(transactionalEntityManager?: EntityManager): Promise<T[]> {
    const repository = this.getRepository(transactionalEntityManager);
    return repository.find();
  }

  // Fetch a single record by a specific column
  async getBy(
    value: unknown,
    columnField: string = 'id',
    relations?: IRelationship[],
    transactionalEntityManager?: EntityManager
  ): Promise<T | null> {
    const repository = this.getRepository(transactionalEntityManager);
    const queryBuilder = repository.createQueryBuilder(this.alias);

    if (relations) {
      relations.forEach((relation) => {
        queryBuilder.leftJoinAndSelect(relation.original, relation.link);
      });
    }

    queryBuilder.where(`${this.alias}.${columnField} = :value`, { value });
    return queryBuilder.getOne();
  }

  // Fetch records by an array of values
  async getByArray(
    values: unknown[],
    columnField: string = 'id',
    transactionalEntityManager?: EntityManager
  ): Promise<T[]> {
    if (!values.length) return [];
    const queryBuilder = await this.createQueryBuilder(transactionalEntityManager);
    queryBuilder.where(`${this.alias}.${columnField} IN (:...values)`, { values });
    return queryBuilder.getMany();
  }

  // Create a single record
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
    transactionalEntityManager?: EntityManager
  ): Promise<void> {
    if (!data.length) return;
    await transactionalEntityManager
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
  ): Promise<T> {
    const repository = this.getRepository(transactionalEntityManager);
    const existingRecord = await this.getBy(id,'id',null,transactionalEntityManager)
    if(existingRecord){
      await repository.update(id, data as QueryDeepPartialEntity<T>);
      return existingRecord;
    }
  }

  // Delete a single record
  async remove(
    id: number,
    transactionalEntityManager?: EntityManager
  ): Promise<void> {
    const repository = this.getRepository(transactionalEntityManager);
    const record =await this.getBy(id,'id',null,transactionalEntityManager)
    if(record){
      await repository.remove(record);
    }
  }

  // Delete multiple records
  async removeArray(
    ids: number[],
    transactionalEntityManager?: EntityManager
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
