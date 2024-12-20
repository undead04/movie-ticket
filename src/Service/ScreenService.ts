import { DeepPartial, EntityManager } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";
import DataService from "./DataService";
import CustomError from "../validations/CustumError";
import { Screen } from "../Data/Screen";
import TheaterService from "./TheaterService";
import { Ticket } from "../Data/Ticket";

export default class ScreenServie extends DataService<Screen>{
    protected theaterService:TheaterService
    protected ticketService:DataService<Ticket>
    constructor(){
        super(Screen,'screen')
        this.theaterService=new TheaterService()
        this.ticketService=new DataService(Ticket,'ticket')
    }
    async getFillter(theaterId?:number,orderBy?:string,sort?:string,page:number=1,pageSize:number=10){
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        let queryBuilder =await (await this.createQueryBuilder()).leftJoinAndSelect('screen.theater','theater')
        if(theaterId){
            queryBuilder=queryBuilder.where("screen.theaterId =:theaterId",{theaterId})      
        }
        if(orderBy){
            queryBuilder=queryBuilder.orderBy(`screen.${orderBy}`,sortOrder)
        }
        const data=await this.getPagination(queryBuilder,page,pageSize)
        return data
    }
    protected async isUniqueName(name:string,theaterId:number){
        const record = await (await this.createQueryBuilder()).andWhere('screen.name =: name',{name})
            .andWhere('screen.theaterId =: theaterId',{theaterId})
        if(record){
            return true
        }
        return false
    }
    protected async getTicket(){
        const recordTicket=await (await this.ticketService.createQueryBuilder())
            .innerJoin('ticket.showtime',"showtime")
        return recordTicket
    }
    protected async validate(id:number,data:DeepPartial<Screen>){
        const recordTheater = await this.theaterService.getBy(data.theater.id)
        if(recordTheater==null) throw new CustomError(`Rạp chiếu phim này không tồn tại id = ${data.theater.id}`,404,'theaterId')
        // Kiểm tra sự tồn tại của bản ghi
        const record = id ? await this.isNotFound(id, `Tên phòng chiếu phimg không tồn tại id = ${id}`) : null;      
        // Kiểm tra tên thể loại có trùng hay không
        const isNameUnique = await this.isUniqueName(data.name,data.theater.id);
        // Nếu record là null (tức là không có bản ghi nào), kiểm tra tên thể loại
        if (record === null && isNameUnique) {
          throw new CustomError(`Tên của căn phòng ${data.name} đã tồn tại trong rạp ${recordTheater.name}`,400,'name')
        }
        // Nếu có bản ghi, kiểm tra nếu tên thể loại trùng với bản ghi khác, và id không giống nhau
        if (record && isNameUnique && record.id !== id) {
          throw new CustomError(`Tên của căn phòng ${data.name} đã tồn tại trong rạp ${recordTheater.name}`,400,'name')
        }
    }
    protected async validateRemove(id:number){
        const ticketRecord = await (await this.getTicket()).andWhere('showtime.screenId=:id',{id}).getOne()
        const record = await this.getBy(id)
        if(ticketRecord){
            throw new CustomError(`Nếu xóa phòng chiếu phim ${record.name} thì lượng lớn dữ liệu sẽ mất`,409)
        }
            
    }
    async create(data: DeepPartial<Screen>, transactionalEntityManager?: EntityManager): Promise<Screen> {
        await this.validate(0,data)
        return await super.create(data,transactionalEntityManager)
    }
    
    async createArray(
        datas: DeepPartial<Screen>[],
        transactionalEntityManager: EntityManager
      ): Promise<void> {
        const arrayName=datas.map(data=>({
            name:data.name,
            theaterId:data.theater
        }))
        if(IsDuplicatesWithSort(arrayName)){
            throw new CustomError(`Tạo phòng chiếu phim thất bại vì có model trùng tên`,400)
        }
        await Promise.all(datas.map(async(data)=>this.validate(0,data)))
        await super.createArray(datas,transactionalEntityManager)
    }
    async remove(id: number, transactionalEntityManager?: EntityManager): Promise<void> {
        await this.validateRemove(id)
        await super.remove(id,transactionalEntityManager)
    }
    async removeArray(ids: number[], transactionalEntityManager?: EntityManager): Promise<void> {
        await Promise.all(ids.map(async(id)=>this.validateRemove(id)))
        await super.removeArray(ids,transactionalEntityManager)
    }
    async update(id: number, data: DeepPartial<Screen>, transactionalEntityManager?: EntityManager): Promise<Screen> {
        await this.validate(id,data)
        return await super.update(id,data)
    }
}