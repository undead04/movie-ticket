import { DeepPartial, EntityManager } from "typeorm";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";
import DataService from "./DataService";
import CustomError from "../validations/CustumError";
import { Theater } from "../Data/Theater";
import dataSource from "../DataSource";

export default class TheaterService{ 
    protected theaterService:DataService<Theater>
    constructor(){
        this.theaterService = new DataService(Theater,'theater')
    }
    async getFillter(name?:string,city?:string,address?:string,orderBy?:string,sort?:string,page:number=1,pageSize:number=10){
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";     
        let queryBuilder =(await this.theaterService.createQueryBuilder())
        if(city){
            queryBuilder=queryBuilder.where("theater.city = :city",{city})
        }
        if(address){
            queryBuilder=queryBuilder.andWhere('theater.address LIKE :address',{address:`%${address}%`})
        }
        if(name){
            queryBuilder=queryBuilder.andWhere('theater.name LIKE:name',{name:`%${name}%`})
        }
        if(orderBy){
            queryBuilder=queryBuilder.orderBy(`theater.${orderBy}`,sortOrder)
        }
        const data=await this.theaterService.getPagination(queryBuilder,page,pageSize)
        return data
    }
    protected async isUnique(name:string){
        const record=await (await this.theaterService.createQueryBuilder())
        .andWhere("LOWER(theater.name) =:name",{name:name.trim().toLowerCase()}).getOne()
        if(record){
            return record
        }
    }
    protected async validateTheater(id:number){
       return await this.theaterService.isNotFound(id, `Tên rạp chiếu này không tồn tại id = ${id}`) 
    }
    protected async validate(id: number, data: DeepPartial<Theater>) {
        // Kiểm tra sự tồn tại của bản ghi
        if(id)  await this.validateTheater(id)
        // Kiểm tra tên rạp chiếu có trùng hay không
        const record = await this.isUnique(data.name);
        // Nếu record là null (tức là không có bản ghi nào), kiểm tra tên rạp chiếu
        if (record  && record.id!=id) {
          throw new CustomError(`Tên rạp chiếu phim ${data.name} đã tồn tại`, 400,'name');
        }

      }
      
    async create(data: DeepPartial<Theater>, transactionalEntityManager?: EntityManager): Promise<Theater> {
        await this.validate(0,data)
        return await this.theaterService.create(data,transactionalEntityManager)
    }
    async createArray(
        datas: DeepPartial<Theater>[],
      ): Promise<void> {
        const arrayName=datas.map(data=>({
            name:data.name.trim().toLocaleLowerCase()
        }))
        if(IsDuplicatesWithSort(arrayName)){
            throw new CustomError(`Tạo thể loại thất bại vì có model trùng tên`,400)
        }
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            for(const data of datas){
                await this.create(data,transactionEntityManager)
            }
        })
        
    }
    async update(id: number, data: DeepPartial<Theater>): Promise<Theater> {
        await this.validate(id,data)
        return await this.theaterService.update(id,data)
    }
    async get(id:number){
        return await this.theaterService.getBy(id)
    }
    async remove(id:number,transactionEntityManager?:EntityManager){
        await this.validateTheater(id)
        await this.theaterService.remove(id,transactionEntityManager)
    }
    async removeArray(ids:number[]){
        if(IsDuplicatesWithSort(ids)){
            throw new CustomError(`Trong req.body có hai id trùng nhau`,400)
        }
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            for(const id of ids){
                await this.remove(id,transactionEntityManager)
            }
        })
    }
    async waningDelete(ids:number[]){
        if(Array.isArray(ids)){
            await Promise.all(ids.map(async(id)=>await this.checkWaningDelete(id)))
        }
    }
    protected async checkWaningDelete(id:number){
        await this.validateTheater(id)
        const record=await (await this.theaterService.createQueryBuilder())
        .innerJoin('theater.screens','screen')
        .andWhere('screen.theaterId=:id',{id}).getOne()
        if(record){
            throw new CustomError(`Bạn xóa rạp chiếu phim này ${record.name} có thể mất nhiều dữ liệu quan trọng`,409)
        }
    }
    
}