import { DataSource, DeepPartial, EntityManager } from "typeorm";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";
import DataService from "./DataService";
import { Genre } from "../Data/Genre";
import CustomError from "../validations/CustumError";
import dataSource from "../DataSource";

export default class GenreService{
    protected genreRepository:DataService<Genre>
    constructor(){
        this.genreRepository = new DataService(Genre,'genre')
    }
    async getFillter(name?:string,orderBy?:string,sort?:string,page:number=1,pageSize:number=10){
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        let queryBuilder = await this.genreRepository.createQueryBuilder()
        if(name){
            queryBuilder=queryBuilder.where("genre.name LIKE :name",{name:`%${name}%`})
        }
        if(orderBy){
            queryBuilder=queryBuilder.orderBy(`genre.${orderBy}`,sortOrder)
        }
        const data=await this.genreRepository.getPagination(queryBuilder,page,pageSize)
        return data
    }
    protected async isUnique(name:string){
        const genre = await (await this.genreRepository.createQueryBuilder())
        .andWhere('LOWER(genre.name) =:name',{name:name.trim().toLowerCase()}).getOne()
        if(genre){
            return genre
        }
    }
    protected async validateGenre(id:number){
        return await this.genreRepository.isNotFound(id, `Tên thể loại này không tồn tại id = ${id}`)
    }
    protected async validate(id: number, data: DeepPartial<Genre>) {
        // Kiểm tra sự tồn tại của bản ghi
        if(id) await this.validateGenre(id)
        // Kiểm tra tên thể loại có trùng hay không
        const record = await this.isUnique(data.name);
        if (record  && record.id !== id) {
          throw new CustomError(`Tên thể loại phim ${data.name} đã tồn tại`, 400,'name');
        }
      }      
    async create(data: DeepPartial<Genre>,transactionEntityManager?:EntityManager): Promise<Genre> {
        
        await this.validate(0,data);
        return await this.genreRepository.create(data,transactionEntityManager)
    }
    async get(id:number){
        return await this.genreRepository.getBy(id)
    }
    async createArray(
        datas: DeepPartial<Genre>[], 
      ): Promise<void> {
        const arrayName=datas.map(data=>({
            name:data.name.trim().toLowerCase()
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
    async update(id: number, data: DeepPartial<Genre>): Promise<Genre> {
        await this.validate(id,data)
        return await this.genreRepository.update(id,data)
    }
    async remove(id:number,transactionEntityManager?:EntityManager){
        await this.validateGenre(id)
        await this.genreRepository.remove(id,transactionEntityManager)
    }
    async removeArray(ids:number[]){
        if(IsDuplicatesWithSort(ids)){
            throw new CustomError(`Trong req.body có hai id trùng nhau`,404)
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
        await this.validateGenre(id)
        const records =await (await this.genreRepository.createQueryBuilder()).innerJoin('genre.movieGenre','movieGenre')
        .andWhere('movieGenre.genreId =:id',{id}).getOne()
        if(records){
            throw new CustomError(`Bạn xóa thể loại ${records.name} có thể mất nhiều dữ liệu quan trọng`,409)
        }
    }
}