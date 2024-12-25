
import { DeepPartial } from 'typeorm';
import CustomError from "../validations/CustumError";
import DataService from "./DataService";
import { Bill } from "../Data/Bill";
import AppRole from "../Model/GroupRoleModel";
import { BillModel, StatusOrder } from "../Model/BillModel";
import { Seat } from "../Data/Seat";
import { Showtime } from "../Data/Showtime";
import dataSource from "../DataSource";
import { generateOrderId, IsDuplicatesWithSort } from '../utils/GenerationCode';
import { Ticket } from '../Data/Ticket';

export default class BillService{
    protected billRepository:DataService<Bill>
    protected seatRepository:DataService<Seat>
    protected showtimeRepository:DataService<Showtime>
    protected ticketRepository:DataService<Ticket>
    constructor(){
        this.billRepository = new DataService(Bill,'bill')
        this.seatRepository = new DataService(Seat,'seat')
        this.showtimeRepository = new DataService(Showtime,'showtime')
        this.ticketRepository = new DataService(Ticket,'ticket')
    }
    async getBillCode(orderCode:string):Promise<Bill>{
        return this.billRepository.getBy(orderCode,'orderCode')
    }
    async getId(id:number){
        const billData = await this.billRepository.getBy(id)
        const ticketData = await (await this.ticketRepository
        .createQueryBuilder())
        .innerJoin('ticket.bill','bill')
        .innerJoin('ticket.showtime', 'showtime')
        .innerJoin('showtime.screen', 'screen')
        .innerJoin('ticket.seat', 'seat')
        .andWhere('bill.id = :id', { id })
        .select([
            'ticket.id',
            'showtime.showDate',      
            'showtime.price',
            'showtime.startTime',
            'showtime.endTime',
            'screen.name',     
            'seat.seatNumber',        
        ])
        .getRawMany();
        const data = {
            bill:billData,
            ticket:ticketData
        }
        return data
    }
    async getFillter(orderCode?:string,statusOrder?:number,role?:string,userId?:number,from?:string,to?:string,orderBy?:string,sort?:string,page:number=1,pageSize:number=10){
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        let queryBuilder =await (await this.billRepository.createQueryBuilder())
        .leftJoinAndSelect("bill.user",'user')
        if(role==AppRole.User){
            queryBuilder=queryBuilder
            .andWhere("bill.userId =:userId",{userId:userId})
            .andWhere('bill.statusOrder =:statusComplete',{statusComplete:StatusOrder.complete})
        }
        if(orderCode){
            queryBuilder=queryBuilder.andWhere('bill.orderCode=:orderCode',{orderCode})
        }
        if(statusOrder){
            queryBuilder=queryBuilder.andWhere('bill.statusOrder=:statusOrder',{statusOrder})
        }
        if(from){
            queryBuilder=queryBuilder.andWhere('bill.bookingTime >=: from',{from})
        }
        if(to){
            queryBuilder=queryBuilder.andWhere('bill.bookingTime<=:to',{to})
        }
        if(orderBy){
            queryBuilder=queryBuilder.orderBy(`bill.${orderBy}`,sortOrder)
        }
        queryBuilder = queryBuilder.select(['bill.id','bill.orderCode','bill.totalPrice','bill.statusOrder','bill.bookingTime'
            ,'bill.paymentMethod','user.id','user.username'
        ])
        const data = await this.billRepository.getPagination(queryBuilder,page,pageSize)
        return data
    }
    protected async Unique(model:BillModel){
        const data = (await this.billRepository.createQueryBuilder())
        .leftJoin("bill.tickets",'ticket')
        .andWhere('ticket.showtimeId=:showtimeId',{showtimeId:model.showtimeId})
        .andWhere('ticket.seatId IN (:...seatId)',{seatId:model.seatId})
        .andWhere('bill.statusOrder != :statusOrder',{statusOrder:StatusOrder.expired}).getOne()
        return data
    }
    protected async validate(
        data: BillModel
    ): Promise<[Showtime, Seat[]]> {
        const dateNow = new Date(new Date().getTime() + 1000 * 60 * 5)
        const showtimeRecord = await this.showtimeRepository.isNotFound(
            data.showtimeId,
            `Thời gian chiếu phim này không tồn tại id = ${data.showtimeId}`,
            400,
            "showtime",[{original:"showtime.screen",link:"screen"}]
        );
        // Chuyển 'startTime' sang dạng 'HH:mm:ss'
        if(IsDuplicatesWithSort(data.seatId)){
            throw new CustomError(`Có ghế trùng nhau`,400)
        }
        const seatRecords=[]
        for(const seat of data.seatId){
            const record =await (await this.seatRepository.createQueryBuilder())
            .andWhere('seat.id =:seatId',{seatId:seat})
            .andWhere('seat.screenId =:screenId',{screenId:showtimeRecord.screen.id}).getOne()
            if(record==null){
                throw new CustomError(`Không tồn tại ghế có id =${seat} trong căn phòng chiếu phim ${showtimeRecord.screen.name}`,400)
            }
            seatRecords.push(seat)
        }
        // Kết hợp `showDate` và `startTime` thành một `Date` đầy đủ
        const combinedDate = `${showtimeRecord.showDate}T${showtimeRecord.startTime}`;
        // Tạo đối tượng Date từ chuỗi kết hợp
        const startDateTime = new Date(combinedDate);

        if (dateNow > startDateTime) {
            throw new CustomError("Vượt quá thời gian cho phép đặt vé", 400);
        }

        const record = await this.Unique(data)
        if(record){
            throw new CustomError(`Hiện tại đã có người khác đặt vé này`,400)
        }
        return [showtimeRecord, seatRecords];
    }
          
    async create(userId:number,data: BillModel): Promise<void> {
        const [showtimeRecord,seatRecords] = await this.validate(data)
        const totalPrice = showtimeRecord.price * seatRecords.length
        let billRecord;
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            billRecord = await this.billRepository.create({
                orderCode: generateOrderId(),
                totalPrice:totalPrice,
                user:{id:userId},
                expiration_time:new Date(new Date().getTime() + 1000 * 60 * 5), 
            },transactionEntityManager)
            await this.ticketRepository.createArray(data.seatId.map((item)=>({
                showtime:{id:data.showtimeId},
                seat:{id:item},
                bill:{id:billRecord.id}
            })),transactionEntityManager)
        })
        return billRecord
    }
    async remove(id:number):Promise<void>{
        await this.billRepository.remove(id)
    }
    async removeArray(ids:number[]):Promise<void>{
        await this.billRepository.removeArray(ids)
    }
    async update(id:number,data:DeepPartial<Bill>):Promise<void>{
        await this.billRepository.update(id,data)
    }
}