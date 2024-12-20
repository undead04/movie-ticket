import { DeepPartial, EntityManager } from "typeorm";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";
import DataService from "./DataService";
import { Genre } from "../Data/Genre";
import CustomError from "../validations/CustumError";

export default class GenreService extends DataService<Genre>{
    constructor(){
        super(Genre,'genre')
    }
    async getFillter(name?:string,orderBy?:string,sort?:string,page:number=1,pageSize:number=10){
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        let queryBuilder = await this.createQueryBuilder()
        if(name){
            queryBuilder=queryBuilder.where("genre.name LIKE :name",{name:`%${name}%`})
        }
        if(orderBy){
            queryBuilder=queryBuilder.orderBy(`genre.${orderBy}`,sortOrder)
        }
        const data=await this.getPagination(queryBuilder,page,pageSize)
        return data
    }
    protected async isUniqueName(name:string){
        const genre=await this.getBy(name,'name')
        if(genre){
            return true
        }
        return false
    }
    protected async validate(id: number, data: DeepPartial<Genre>) {
        // Kiểm tra sự tồn tại của bản ghi
        const record = id ? await this.isNotFound(id, `Tên thể loại này không tồn tại id = ${id}`) : null;
        
        // Kiểm tra tên thể loại có trùng hay không
        const isNameUnique = await this.isUniqueName(data.name);
        
        // Nếu record là null (tức là không có bản ghi nào), kiểm tra tên thể loại
        if (record === null && isNameUnique) {
          throw new CustomError(`Tên thể loại phim ${data.name} đã tồn tại`, 400,'name');
        }
        
        // Nếu có bản ghi, kiểm tra nếu tên thể loại trùng với bản ghi khác, và id không giống nhau
        if (record && isNameUnique && record.id !== id) {
          throw new CustomError(`Tên thể loại phim ${data.name} đã tồn tại`, 400,'name');
        }
      }      
    async create(data: DeepPartial<Genre>, transactionalEntityManager?: EntityManager): Promise<Genre> {
        
        await this.validate(0,data);
        return await super.create(data,transactionalEntityManager)
    }
    async createArray(
        datas: DeepPartial<Genre>[],
        transactionalEntityManager: EntityManager
      ): Promise<void> {
        const arrayName=datas.map(data=>({
            name:data.name
        }))
        if(IsDuplicatesWithSort(arrayName)){
            throw new CustomError(`Tạo thể loại thất bại vì có model trùng tên`,400)
        }
        await Promise.all(datas.map(async(data)=>this.validate(0,data)))
        await super.createArray(datas,transactionalEntityManager)
      }
    async update(id: number, data: DeepPartial<Genre>, transactionalEntityManager?: EntityManager): Promise<Genre> {
        await this.validate(id,data)
        return await super.update(id,data,transactionalEntityManager)
    }
}