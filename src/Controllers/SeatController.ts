import { NextFunction,Request,Response } from "express";
import { ISeatModel, SeatModel } from "../Model/SeatModel";
import dataService from "../Service/DataService";
import { Seat } from "../Data/Seat";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import dataController from "./DataController";
import { Screen } from "../Data/Screen";
import { IDataDeleteModel } from "../Model/dataModel";
import dataSource from "../DataSource";
import { Ticket } from "../Data/Ticket";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";
import { Showtime } from "../Data/Showtime";

const getAllWithFilterAndPagination=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const {screenId,orderBy,sort,page,pageSize}=req.query;
        const pageNumber = Number(page) || 1;
        const pageSizeNumber = Number(pageSize) || 10;
        const orderByField=orderBy as string;
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        let queryBuilder =(await dataService.getBuilderQuery(Seat,"seat")).leftJoinAndSelect("seat.screen","sreen")
        if(screenId){
            queryBuilder=queryBuilder.where("seat.screenId = :screenId",{screenId})
        }
        if(orderByField){
            queryBuilder=queryBuilder.orderBy(`seat.${orderByField}`,sortOrder)
        }
        const data=await dataService.getAllPagination(Seat,queryBuilder,pageNumber,pageSizeNumber)
        res.status(200).json(RepositoryDTO.WithData(200,data))
        
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const get=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        const id=Number(req.params.id);
        const data=await dataService.getBy(Seat,"seat",id);
        if(await dataController.IsNotFound(res,data,"Không tìm thấy ghế này")) return
         res.status(200).json(RepositoryDTO.WithData(200,data))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const remove=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
       const id=Number(req.params.id)
       const record=await dataService.getBy(Seat,"seat",id)
       const recordTicket=await (await dataService.getBuilderQuery(Ticket,'ticket'))
       .innerJoin('ticket.seat',"seat")
       .andWhere('ticket.seatId=:id',{id})
       .getOne()
       if(await dataController.IsNotFound(res,record,"Không tìm thấy ghế này")) return
       if(recordTicket){
        res.status(409).json(RepositoryDTO.Error(409,`Không đc xóa ghê ${record.seatNumber} bởi vì sẽ mất nhiều dữ liệu quan trộng`))
        return
       }
        await dataService.remove(Seat,record)
        res.status(200).json(RepositoryDTO.Success("Xóa ghê thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const create=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        const model:ISeatModel=req.body
        const validateError = new SeatModel(0,model);
        const dataScreen=await dataService.getBy(Screen,"screen",model.screenId)
        const coutDataSeat=await (await dataService.getBuilderQuery(Seat,'seat')).andWhere('seat.screenId=:screenId',{screenId:model.screenId})
        .getCount()
        if(await dataController.validateError(res,validateError)) return;
        // kiểm tra có nên tạo thêm dữ liệu không
        if(dataScreen.seatCapacity<coutDataSeat+1){
            res.status(400).json(`Đã vượt quá số ghế cho phép trong phòng là ${dataScreen.seatCapacity}`)
            return;
        }
        await dataService.create(Seat,{
            ...model,
            screen:{id:model.screenId}
        })
        res.status(200).json(RepositoryDTO.Success("Tạo ghế thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const update=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const id=Number(req.params.id);
        const model:ISeatModel=req.body;
        const data=await dataService.getBy(Seat,"seat",id)
        const validateError = new SeatModel(id,model);
        if(await dataController.IsNotFound(res,data,"Không tìm thấy ghế này")) return;
        if(await dataController.validateError(res,validateError)) return;
        await dataService.update(Seat,data,{
            row:model.row,
            col:model.col,
            seatNumber:model.seatNumber,
            screen:{id:model.screenId}
        })
         res.status(200).json(RepositoryDTO.Success("Cập nhập ghế thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const removeArray=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const model:IDataDeleteModel=req.body;
        const records=await dataService.getByArray(Seat,"seat",model.ids);
        const recordTicket=await (await dataService.getBuilderQuery(Ticket,'ticket'))
            .innerJoin('ticket.seat',"seat")
            .andWhere('ticket.seatId IN (:...id)',{id:model.ids})
            .getOne()
        if(await dataController.IsNotFoundArray(res,records,"Không tìm thấy các ghế này ")) return
        if(recordTicket){
            res.status(409).json(RepositoryDTO.Error(409,`Không đc xóa các ghê này bởi vì sẽ mất nhiều dữ liệu quan trọng`))
            return
        }
        await dataSource.manager.transaction(async (transactionEntityManager)=>{
            await dataService.removeArray(Seat,model.ids,transactionEntityManager)
        })
        res.status(200).json(RepositoryDTO.Success("Xóa các ghế này thành công"))
     }catch(error:any){
         console.log(error)
         res.status(500).json(error)
     }
}
const createArray=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        // Tạo đối tượng từ request body
        const models:ISeatModel[]=req.body;
        const arrayModel=models.map(model=>({
            row:model.row,
            col:model.col,
            seatNumber:model.seatNumber.trim().toLowerCase()
        }))
        if(IsDuplicatesWithSort(arrayModel)){
            res.status(400).json(RepositoryDTO.Error(400,`Tạo thể loại thất bại vì model có trùng row hoặc col`))
            return
        }
        for (const model of models) {
            const validateError = new SeatModel(0, model);  // Tạo đối tượng kiểm tra lỗi từ model
            if (await dataController.validateError(res, validateError)) return
        }
        await dataSource.manager.transaction(async (transactionEntityManager)=>{
            await dataService.createArray(Seat,models.map((model)=>({
                row:model.row,
                col:model.col,
                seatNumber:model.seatNumber,
                screen:{id:model.screenId}
            })),transactionEntityManager)
        })
        
         res.status(200).json(RepositoryDTO.Success("Tạo danh sách ghế thành công thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const getStatusSeat=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const id=req.params.id
        const showtimeData=await dataService.getBy(Showtime,'showtime',id)
        if(await dataController.IsNotFound(res,showtimeData,"Không tìm thấy lịch chiếu phim này")) return
        const seatStatus = await (await dataService.getBuilderQuery(Seat,'seat'))
            .leftJoinAndSelect('seat.tickets', 'ticket', 'ticket.seatId = seat.id AND ticket.showtimeId = :showtimeId', { showtimeId: id })
            .leftJoinAndSelect('ticket.bill','bill','bill.id = ticket.billId AND bill.statusOrder = 2')            
            .select([
                'seat.*',
                `CASE 
                    WHEN ticket.id IS NULL OR bill.id IS NULL THEN false
                    ELSE true
                END AS status`,
            ])
            .getRawMany();
            res.status(200).json(RepositoryDTO.WithData(200,seatStatus))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }
}
const seatController={
    create,get,remove,getAllWithFilterAndPagination,update,removeArray,createArray,getStatusSeat
}
export default seatController