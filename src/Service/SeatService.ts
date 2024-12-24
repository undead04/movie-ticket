import { DeepPartial, EntityManager } from "typeorm";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";
import DataService from "./DataService";
import CustomError from "../validations/CustumError";
import { Seat } from './../Data/Seat';
import { Screen } from "../Data/Screen";
import { Ticket } from "../Data/Ticket";
import { Showtime } from "../Data/Showtime";
import dataSource from "../DataSource";
import { validate } from 'class-validator';

export default class SeatService{
    protected screenRepository:DataService<Screen>
    protected ticketRepository:DataService<Ticket>
    protected showtimeRepository:DataService<Showtime>
    protected seatRepository:DataService<Seat>
    constructor(){
        this.seatRepository = new DataService(Seat,'seat')
        this.screenRepository = new DataService(Screen,'screen')
        this.ticketRepository = new DataService(Ticket,'ticket')
        this.showtimeRepository = new DataService(Showtime,'showtime')
    }
    async getSeatStatus(showtimeId:number){
        const showtimeRecord = await this.showtimeRepository.getBy(showtimeId);
        if(showtimeRecord==null){
            throw new CustomError(`thời gian chiếu phim có id = ${showtimeId} không tồn tại`,404)
        }
        const seatStatus = await (await this.seatRepository.createQueryBuilder())
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
    async getFillter(screenId?:number,orderBy?:string,sort?:string,page:number=1,pageSize:number=10){
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        let queryBuilder =(await this.seatRepository.createQueryBuilder())
        .leftJoinAndSelect("seat.screen","screen")
        if(screenId){
            queryBuilder=queryBuilder.where("seat.screenId =:screenId",{screenId})
        }
        if(orderBy){
            queryBuilder=queryBuilder.orderBy(`seat.${orderBy}`,sortOrder)
        }
        const data=await this.seatRepository.getPagination(queryBuilder,page,pageSize)
        return data
    }
    protected async isUnique(model: DeepPartial<Seat>) {
        const record = await (await this.seatRepository.createQueryBuilder())
          .andWhere("seat.row = :row", { row: model.row })
          .andWhere("seat.col = :col", { col: model.col })
          .andWhere("seat.screenId = :screenId", { screenId: model.screen?.id })
          .getOne();
        if(record) return record; // Trả về true nếu record tồn tại, ngược lại trả về false
        
      }
    protected async validateScreen(id:number):Promise<Screen>{
        return await this.screenRepository.isNotFound(id,`Không tìm thấy phòng chiếu phim có id =${id}`,400,'screenId')
    }
    protected async validateSeat(id:number){
        return await this.seatRepository.isNotFound(id,`Không tìm thấy ghế có id = ${id}`,404)
    }
    protected async limitSeat(screenId:number,modelCount:number){
        const recordScreen = await this.validateScreen(screenId)
        const recordSeatCout = (await this.getFillter(screenId)).total
        if(recordSeatCout+modelCount>recordScreen.seatCapacity){
            throw new CustomError(`không thể thêm vì vượt quá mướt cho phép của phòng chiếu phim ${recordScreen.name} và hiện tại số ghế là ${recordSeatCout}`,400)
        }
    }
    protected async validate(id:number,model:DeepPartial<Seat>):Promise<void>{
        const recordScreen = await this.validateScreen(model.screen.id)
        if(id) await this.validateSeat(id)
        const record = await this.isUnique(model)
        
        if(record && record.id !== id){
            throw new CustomError(`Vị trí ghế row: ${model.row} col: ${model.col} đã tồn tại trong phòng chiếu phim ${recordScreen.name}`,400,'row')
        }
        
    }
    async create(data: DeepPartial<Seat>, transactionalEntityManager?: EntityManager): Promise<Seat> {
        await this.limitSeat(data.screen.id,1)
        await this.validate(0,data)
        return await this.seatRepository.create(data,transactionalEntityManager)
    }
    async createArray(
        datas: DeepPartial<Seat>[],
      ): Promise<void> {
        const arrayName=datas.map(data=>({
            row:data.row,
            col:data.col,
            screenId:data.screen.id
        }))
        if(IsDuplicatesWithSort(arrayName)){
            throw new CustomError(`Tạo thể loại thất bại vì có model trùng`,400)
        }
        
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            for(const data of datas){
                await this.limitSeat(data.screen.id,1)
                await this.create(data,transactionEntityManager)
            }
        })
      }
      async remove(id: number,transactionEntityManager?:EntityManager): Promise<void> {
        await this.validateSeat(id)
        await this.seatRepository.remove(id,transactionEntityManager)
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
            await this.validateSeat(id)
            const records =await (await this.seatRepository.createQueryBuilder())
            .innerJoin('seat.tickets','ticket')
            .andWhere('ticket.seatId =:id',{id}).getOne()
            if(records){
                throw new CustomError(`Bạn xóa ghế ${records.seatNumber} có thể mất nhiều dữ liệu quan trọng`,409)
            }
        }
        async get(id:number){
            return await this.seatRepository.getBy(id,'id',[{
                original:"seat.screen",link:"screen"
            }])
        }
         async update(id: number, data: DeepPartial<Seat>): Promise<Seat> {
                await this.validate(id,data)
                return await this.seatRepository.update(id,data)
            }
}