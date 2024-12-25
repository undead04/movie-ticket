import { DeepPartial, EntityManager } from "typeorm";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";
import DataService from "./DataService";
import CustomError from "../validations/CustumError";
import { Screen } from "../Data/Screen";
import { Theater } from "../Data/Theater";
import dataSource from "../DataSource";

export default class ScreenServie{
    protected theaterRepository: DataService<Theater>
    protected screenRepository: DataService<Screen>
    constructor(){
        this.screenRepository = new DataService(Screen,'screen')
        this.theaterRepository=new DataService(Theater,'theater')
    }
    async getFillter(theaterId?:number,orderBy?:string,sort?:string,page:number=1,pageSize:number=10){
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        let queryBuilder =await (await this.screenRepository.createQueryBuilder())
        .leftJoinAndSelect('screen.theater','theater')
        if(theaterId){
            queryBuilder=queryBuilder.where("screen.theaterId =:theaterId",{theaterId})      
        }
        if(orderBy){
            queryBuilder=queryBuilder.orderBy(`screen.${orderBy}`,sortOrder)
        }
       // Liệt kê cụ thể các trường cần select
        queryBuilder = queryBuilder.select([
        'screen.id',
        'screen.name',
        'screen.seatCapacity',
        'theater.id',
        'theater.name',
        'theater.address'
        ]);
        const data=await this.screenRepository.getPagination(queryBuilder,page,pageSize)
        return data
    }
    protected async IsUnique(name:string,theaterId:number){
        const record = await (await this.screenRepository.createQueryBuilder())
        .andWhere('LOWER(screen.name) =:name',{name:name.trim().toLowerCase()})
        .andWhere('screen.theaterId =:theaterId',{theaterId}).getOne()
        if(record){
            return record
        }
    }
    protected async validateTheater(id:number){
        const record = await this.theaterRepository.isNotFound(id,`Rạp chiếu phim này không tồn tại id = ${id}`,400,'theaterId')
        return record
    }
    protected async validateScreen(id:number){
        return await this.screenRepository.isNotFound(id, `Tên phòng chiếu phimg không tồn tại id = ${id}`)
    }
    protected async validate(id:number,data:DeepPartial<Screen>){
        if(id)  await this.validateScreen(id)
        const recordTheater = await this.validateTheater(data.theater.id)
        // Kiểm tra tên thể loại có trùng hay không
        const record = await this.IsUnique(data.name,data.theater.id);
        // Nếu record là null (tức là không có bản ghi nào), kiểm tra tên thể loại
        if (record && record.id!==id) {
          throw new CustomError(`Tên của căn phòng ${data.name} đã tồn tại trong rạp ${recordTheater.name}`,400,'name')
        }
    }
    async create(data: DeepPartial<Screen>, transactionalEntityManager?: EntityManager): Promise<Screen> {
        await this.validate(0,data)
        return await this.screenRepository.create(data,transactionalEntityManager)
    }
    async createArray(
        datas: DeepPartial<Screen>[],
      ): Promise<void> {
        const arrayName=datas.map(data=>({
            name:data.name.trim().toLowerCase(),
            theaterId:data.theater
        }))
        if(IsDuplicatesWithSort(arrayName)){
            throw new CustomError(`Tạo phòng chiếu phim thất bại vì có model trùng tên`,400)
        }
        await Promise.all(datas.map(async(data)=>{
            await this.validate(0,data)
        }))
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            this.screenRepository.createArray(datas,transactionEntityManager)
        })
        
    }
    async remove(id: number): Promise<void> {
        await this.validateScreen(id)
        await this.screenRepository.remove(id)
    }
    async removeArray(ids:number[]){
        if(IsDuplicatesWithSort(ids)){
            throw new CustomError(`Trong req.body có hai id trùng nhau`,400)
        } 
        await Promise.all(ids.map(async(id)=>await this.validateScreen(id)))
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            this.screenRepository.removeArray(ids,transactionEntityManager)
        })
    }
    async update(id: number, data: DeepPartial<Screen>): Promise<Screen> {
        await this.validate(id,data)
        return await this.screenRepository.update(id,data)
    }
    async waningDelete(ids:number[]){
            if(Array.isArray(ids)){
                await Promise.all(ids.map(async(id)=>await this.checkWaningDelete(id)))
            }
        }
    protected async checkWaningDelete(id:number){
        await this.validateScreen(id)
        const records =await (await this.screenRepository.createQueryBuilder())
        .innerJoin('screen.seats','seat')
        .innerJoin('screen.showtimes','showtime')
        .andWhere('seat.screenId =:id',{id})
        .orWhere('showtime.screenId=:id',{id})
        .getOne()
        if(records){
            throw new CustomError(`Bạn xóa phòng chiếu phim ${records.name} có thể mất nhiều dữ liệu quan trọng`,409)
        }
    }
    async get(id:number){
        return await this.screenRepository.getBy(id,'id',[{
            original:"screen.theater",link:"theater"
        }],[
        'screen.id',
        'screen.name',
        'screen.seatCapacity',
        'theater.id',
        'theater.name',
        'theater.address'
        ])
    }

}