import { DeepPartial, EntityManager } from "typeorm";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";
import DataService from "./DataService";
import CustomError from "../validations/CustumError";
import { Seat } from './../Data/Seat';
import ScreenServie from "./ScreenService";
import { Screen } from "../Data/Screen";
import { Ticket } from "../Data/Ticket";
import { Showtime } from "../Data/Showtime";

export default class SeatService extends DataService<Seat>{
    protected screenService:ScreenServie
    protected ticketService:DataService<Ticket>
    protected showtimeService:DataService<Showtime>
    constructor(){
        super(Seat,'seat')
        this.screenService = new ScreenServie()
        this.ticketService = new DataService(Ticket,'ticket')
        this.showtimeService = new DataService(Showtime,'showtime')
    }
    async getSeatStatus(showtimeId:number){
        const showtimeRecord = await this.showtimeService.getBy(showtimeId);
        if(showtimeRecord==null){
            throw new CustomError(`thời gian chiếu phim có id = ${showtimeId} không tồn tại`,404)
        }
        const seatStatus = await (await this.createQueryBuilder())
        .leftJoinAndSelect('seat.tickets', 'ticket', 'ticket.seatId = seat.id AND ticket.showtimeId = :showtimeId', { showtimeId })
        .leftJoinAndSelect('ticket.bill','bill','bill.id = ticket.billId AND bill.statusOrder = 2')            
        .select([
            'seat.*',
            `CASE 
                WHEN ticket.id IS NULL OR bill.id IS NULL THEN false
                ELSE true
            END AS status`,
        ])
        .getRawMany();
        return seatStatus
    }
    async getFillter(screeId?:number,orderBy?:string,sort?:string,page:number=1,pageSize:number=10){
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        let queryBuilder =(await this.createQueryBuilder()).leftJoinAndSelect("seat.screen","sreen")
        if(screeId){
            queryBuilder=queryBuilder.where("seat.screenId = :screenId",{screeId})
        }
        if(orderBy){
            queryBuilder=queryBuilder.orderBy(`seat.${orderBy}`,sortOrder)
        }
        const data=await this.getPagination(queryBuilder,page,pageSize)
        return data
    }
    protected async isUnique(model: DeepPartial<Seat>): Promise<boolean> {
        const record = await (await this.createQueryBuilder())
          .andWhere("seat.row = :row", { row: model.row })
          .andWhere("seat.col = :col", { col: model.col })
          .andWhere("seat.screenId = :screenId", { screenId: model.screen?.id })
          .getOne();
      
        return !!record; // Trả về true nếu record tồn tại, ngược lại trả về false
      }
    protected async isExits(model:DeepPartial<Seat>):Promise<Screen>{
        const record = await this.screenService.getBy(model.screen.id)
        return record;
    }
    protected async validateRemove(id:number):Promise<void>{
        const record=await this.getBy(id)
        if(record == null){
            throw new CustomError(`Không tìm thấy ghế có id = ${id}`,404)
        }
        const recordTicket=await (await this.ticketService.createQueryBuilder())
                .innerJoin('ticket.seat',"seat")
                .andWhere('ticket.seatId=:id',{id})
                .getOne()
        if(recordTicket){
            throw new CustomError(`Không đc xóa ghê ${record.seatNumber} bởi vì sẽ mất nhiều dữ liệu quan trộng`,409)
        }
    }
    protected async validateCreate(model:DeepPartial<Seat>):Promise<void>{
        const recordScreen = await this.isExits(model)
        if(recordScreen==null){
            throw new CustomError(`Không tồn tại phòng chiếu phim có id = ${model.screen.id}`,400,'theaterId')
        }
        if(await this.isUnique(model)){
            throw new CustomError(`Vị trí ghế này đã tồn tại trong phòng chiếu phim ${recordScreen.name}`,400,'row')
        }
    }
    async create(data: DeepPartial<Seat>, transactionalEntityManager?: EntityManager): Promise<Seat> {
        await this.validateCreate(data)
        return await super.create(data,transactionalEntityManager)
    }
    async createArray(
        datas: DeepPartial<Seat>[],
        transactionalEntityManager: EntityManager
      ): Promise<void> {
        const arrayName=datas.map(data=>({
            row:data.row,
            col:data.col,
            screenId:data.screen.id
        }))
        if(IsDuplicatesWithSort(arrayName)){
            throw new CustomError(`Tạo thể loại thất bại vì có model trùng`,400)
        }
        await Promise.all(datas.map(async (data)=> this.validateCreate(data)))
        super.createArray(datas,transactionalEntityManager)
      }
      async remove(id: number, transactionalEntityManager?: EntityManager): Promise<void> {
          await this.validateRemove(id)
          await super.remove(id,transactionalEntityManager)
      }
     async removeArray(ids: number[], transactionalEntityManager?: EntityManager): Promise<void> {
         await Promise.all(ids.map(async(id)=>await this.validateRemove(id)))
         await super.removeArray(ids,transactionalEntityManager)
     }
}