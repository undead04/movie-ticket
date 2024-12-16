import { EntityTarget, DeepPartial, ObjectLiteral, FindOptionsWhere, SelectQueryBuilder, DataSource, EntityManager } from 'typeorm';
import dataSource from "../DataSource";
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface IDataFilter{
  columnFilter:string,
  value:unknown,
  operater:string,
}
export interface IRelationship{
  original:string;
  link:string
}
const getBuilderQuery = async <T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  alias?:string
) => {
  const  repository=await getRepository(entity)

  let queryBuilder = repository.createQueryBuilder(alias);
  return queryBuilder
};
const getFilter = async <T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  queryBuilder:SelectQueryBuilder<T>,
  dataFilter:IDataFilter[],
  alias?:string,
) => {
  queryBuilder = await getBuilderQuery(entity,alias)
  dataFilter.forEach(data => {
    if(data.operater=="IN"){
      queryBuilder.andWhere(`${alias}.${data.columnFilter} ${data.operater} (:...${data.columnFilter})`,{[data.columnFilter]:data.value})
    }else if(data.operater=="LIKE"){
      queryBuilder.andWhere(`${alias}.${data.columnFilter} LIKE :${data.columnFilter})`,{[data.columnFilter]:`%${data.value}%`})
    }else{
      queryBuilder.andWhere(`${alias}.${data.columnFilter} ${data.operater}:${data.columnFilter})`,{[data.columnFilter]:data.value})
    }

  });
  return queryBuilder
};
const getRepository=async<T extends ObjectLiteral>(entity:EntityTarget<T>)=>{
  const repository=dataSource.getRepository<T>(entity);
  return repository
}
const getAllPagination = async function<T extends ObjectLiteral>(entity:EntityTarget<T>,data:SelectQueryBuilder<T>,page:number=1,pageSize:number=10) {
   // Tính toán phân trang
   data = data
   .skip((page - 1) * pageSize)
   .take(pageSize);

 // Lấy dữ liệu với filter và phân trang
 const [records, total] = await data.getManyAndCount();

 // Trả về dữ liệu và tổng số bản ghi để dễ dàng tính toán số trang
 return {
   records,
   total,
   page,
   pageSize,
   totalPages: Math.ceil(total / pageSize),
 };
}

const createArray = async <T extends ObjectLiteral>(
  entity: EntityTarget<T>, 
  datas: QueryDeepPartialEntity<T>[], 
  transactionalEntityManager: EntityManager
): Promise<void> => {
  if (datas.length === 0) {
    console.warn('No data to insert');
    return;
  }
  try {
    await transactionalEntityManager
      .createQueryBuilder()
      .insert()
      .into(entity)
      .values(datas)
      .execute();
  } catch (error) {
    console.error(`Failed to insert data into ${entity}:`, error);
    throw error;
  }
};

const create = async <T extends ObjectLiteral>(
  entity: EntityTarget<T>, 
  data: DeepPartial<T>,
  transactionalEntityManager?: EntityManager
): Promise<T> => {
  const repository = transactionalEntityManager
    ? transactionalEntityManager.getRepository<T>(entity)
    : dataSource.getRepository<T>(entity);
  const newRecord = repository.create(data);
  const savedRecord = await repository.save(newRecord);
  return savedRecord;
};
// function update
const updateArray=async <T extends ObjectLiteral>(
  entity:EntityTarget<T>,
  record:T[],
  data:QueryDeepPartialEntity<T>,
  transactionalEntityManager?: EntityManager
):Promise<T[]>=>{
    await Promise.all(record.map((item)=>update(entity,item,data,transactionalEntityManager)))
    return record
}
const update = async <T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  record:T,
  data: QueryDeepPartialEntity<T>,
  transactionalEntityManager?: EntityManager
):Promise<T>=> {
  const repository = transactionalEntityManager
    ? transactionalEntityManager.getRepository<T>(entity)
    : dataSource.getRepository<T>(entity);
  if(record){
    await repository.update(record.id, data);
    return record
  }
};

//function Remove
const removeArray = async <T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  ids:number[],
  transactionalEntityManager: EntityManager
): Promise<void> => {
  if (ids.length === 0) {
    console.warn('No records to delete');
    return;
  }

  try {
    // Thực hiện xóa bằng danh sách ID
    await transactionalEntityManager
      .createQueryBuilder()
      .delete()
      .from(entity)
      .whereInIds(ids) // Sử dụng danh sách ID để xác định bản ghi cần xóa
      .execute();
  } catch (error) {
    console.error(`Failed to delete records from ${entity}:`, error);
    throw error;
  }
};
const remove = async <T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  records: T,
  transactionalEntityManager?: EntityManager
  ):Promise<void> =>{
    const repository = transactionalEntityManager
    ? transactionalEntityManager.getRepository<T>(entity)
    : dataSource.getRepository<T>(entity);
  await repository.remove(records);
};
const getByArray = async <T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  alias: string,
  values: unknown[],
  columnField: string = 'id',
  transactionalEntityManager?: EntityManager
): Promise<T[]> => {
  if (values.length === 0) {
    console.warn('No values provided for fetching records');
    return [];
  }

  try {
    // Sử dụng transactionalEntityManager nếu có, nếu không thì sử dụng dataSource
    const manager = transactionalEntityManager || dataSource.manager;

    // Tạo truy vấn với điều kiện WHERE IN
    return await manager
      .createQueryBuilder<T>(entity, alias)
      .where(`${alias}.${columnField} IN (:...values)`, { values })
      .getMany();
  } catch (error) {
    console.error(`Failed to fetch records from ${entity}:`, error);
    throw error;
  }
};


const getBy = async <T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  alias:string,
  value: unknown,
  columnField: string = "id",
  relations?: IRelationship[], // Danh sách các bảng cần join
  transactionalEntityManager?: EntityManager
): Promise<T | null> => {
  const repository = transactionalEntityManager
    ? transactionalEntityManager.getRepository<T>(entity)
    : dataSource.getRepository<T>(entity);

  // Sử dụng QueryBuilder để hỗ trợ join
  const queryBuilder = repository.createQueryBuilder(alias);

  // Thêm các mối quan hệ (join)
  if (relations) {
    relations.forEach((relation) => {
      queryBuilder.leftJoinAndSelect(`${relation.original}`, relation.link);
    });
  }

  // Thêm điều kiện where
  queryBuilder.where(`${alias}.${columnField} = :value`, { value });

  // Thực thi truy vấn
  return await queryBuilder.getOne();
};



// DataService with generics
const dataService = {
  getBy,
  getFilter,
  getBuilderQuery,
  getAllPagination,
  getRepository,
  create,
  update,
  remove,
  createArray,
  updateArray,
  removeArray,
  getByArray
}

export default dataService;
