import { DeepPartial, EntityManager } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";
import DataService from "./DataService";
import CustomError from "../validations/CustumError";
import { Theater } from "../Data/Theater";
import { Ticket } from "../Data/Ticket";

export default class TheaterService extends DataService<Theater>{ 
    protected ticketService:DataService<Ticket>
    constructor(){
        super(Theater,'theater')
        this.ticketService = new DataService(Ticket,'ticket')
    }
    async getFillter(name?:string,city?:string,address?:string,orderBy?:string,sort?:string,page:number=1,pageSize:number=10){
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";     
        let queryBuilder =(await this.createQueryBuilder())
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
        const data=await this.getPagination(queryBuilder,page,pageSize)
        return data
    }
    protected async isUniqueName(name:string){
        const record=await this.getBy(name,'name')
        if(record){
            return true
        }
        return false
    }
    protected async validate(id: number, data: DeepPartial<Theater>) {
        // Kiểm tra sự tồn tại của bản ghi
        const record = id ? await this.isNotFound(id, `Tên rạp chiếu này không tồn tại id = ${id}`) : null;
        // Kiểm tra tên rạp chiếu có trùng hay không
        const isNameUnique = await this.isUniqueName(data.name);
        // Nếu record là null (tức là không có bản ghi nào), kiểm tra tên rạp chiếu
        if (record === null && isNameUnique) {
          throw new CustomError(`Tên rạp chiếu phim ${data.name} đã tồn tại`, 400,'name');
        }
        // Nếu có bản ghi, kiểm tra nếu tên rạp chiếu trùng với bản ghi khác, và id không giống nhau
        if (record && isNameUnique && record.id !== id) {
          throw new CustomError(`Tên rạp chiếu phim ${data.name} đã tồn tại`, 400,'name');
        }
      }
      
    protected async getTicket(){
        const recordTicket=await (await this.ticketService.createQueryBuilder())
            .innerJoin('ticket.showtime',"showtime")
            .innerJoin('showtime.screen','screen')
        return recordTicket
    }
    protected async validateRemove(id:number){
        const record = await this.getBy(id)
        const ticketRecord = await (await this.getTicket()).andWhere('screen.theaterId =: id',{id}).getOne()
        if(ticketRecord){
            throw new CustomError(`Nếu xóa rạp chiếu phim ${record.name} thì lượng lớn dữ liệu sẽ mất`,409)
        }
    }
    async create(data: DeepPartial<Theater>, transactionalEntityManager?: EntityManager): Promise<Theater> {
        await this.validate(0,data)
        return await super.create(data,transactionalEntityManager)
    }
    async createArray(
        datas: DeepPartial<Theater>[],
        transactionalEntityManager: EntityManager
      ): Promise<void> {
        const arrayName=datas.map(data=>({
            name:data.name
        }))
        if(IsDuplicatesWithSort(arrayName)){
            throw new CustomError(`Tạo thể loại thất bại vì có model trùng tên ${arrayName[0].name}`,400)
        }
        await Promise.all(datas.map(async(data)=>this.validate(0,data)))
        await super.createArray(datas,transactionalEntityManager)
      }
    async remove(id: number, transactionalEntityManager?: EntityManager): Promise<void> {
        await this.validateRemove(id)
        await super.remove(id,transactionalEntityManager)
    }
    async removeArray(ids: number[], transactionalEntityManager?: EntityManager): Promise<void> {
        await Promise.all(ids.map(async(id)=> this.validateRemove(id)))
        await super.removeArray(ids,transactionalEntityManager)
    }
    async update(id: number, data: DeepPartial<Theater>, transactionalEntityManager?: EntityManager): Promise<Theater> {
        await this.validate(id,data)
        return await super.update(id,data,transactionalEntityManager)
    }
    
}