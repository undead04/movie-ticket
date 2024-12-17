import { NextFunction,Request,Response } from "express";
import { generateOrderId } from "../utils/GenerationCode";
import dataService from "../Service/DataService";
import { Bill } from "../Data/Bill";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import dataController from "./DataController";
import { AuthRequest } from "../Middlewares/Auth";
import { IBillModel, IBillUpdateModel } from "../Model/BillModel";
import dataSource from "../DataSource";
import { Ticket } from "../Data/Ticket";
import AppRole from "../Model/GroupRoleModel";

const getAllWithFilterAndPagination=async(req:AuthRequest,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const {from,to,statusOrder,orderCode,orderBy,sort,page,pageSize}=req.query;
        const userId=req._id;
        const role:string=req.role
        const pageNumber = Number(page) || 1;
        const pageSizeNumber = Number(pageSize) || 10;
        const orderByField=orderBy as string;
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        let queryBuilder =(await dataService.getBuilderQuery(Bill,'bill')).leftJoinAndSelect("bill.user",'user')
        if(role==AppRole.User){
            queryBuilder=queryBuilder.andWhere("bill.userId =:userId",{userId:userId})
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
        if(orderByField){
            queryBuilder=queryBuilder.orderBy(`bill.${orderByField}`,sortOrder)
        }
        const data=await dataService.getAllPagination(Bill,queryBuilder,pageNumber,pageSizeNumber)
        res.status(200).json(RepositoryDTO.WithData(200,data))
        
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const get=async(req:Request,res:Response,next:NextFunction):Promise<void> =>{
    try{
        const id=Number(req.params.id);
        const data=await dataService.getBy(Bill,'bill',id,"id",[
            {
                original:"bill.user",link:'user'
            },{original:'bill.ticket',link:"ticket"}
        ]);
        if(await dataController.IsNotFound(res,data,"Không tìm thấy hóa đơn này")) return
        res.status(200).json(RepositoryDTO.WithData(200,data))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const remove=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
       const id=Number(req.params.id)
       const data=await dataService.getBy(Bill,'bill',id)
       if(await dataController.IsNotFound(res,data,"Không tìm thấy hóa đơn này")) return
        await dataService.remove(Bill,data)
        res.status(200).json(RepositoryDTO.Success("Xóa hóa đơn thành công thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const create=async(req:AuthRequest,res:Response,next:NextFunction):Promise<void>=>{
    try{
      const model:IBillModel=req.body;
      const userId:number=req._id;
      let dataBill;
      await dataSource.manager.transaction(async(transtionEntityManager)=>{
        dataBill= await dataService.create(Bill,{
            totalPrice:model.totalPrice,
            user:{id:userId},
            orderCode:generateOrderId(),
            expiration_time:model.expiration_time
          },transtionEntityManager)
        
        await dataService.createArray(Ticket,
            model.seatId.map((seat)=>({
                showtime:{id:model.showtimeId},
                seat:{id:seat},
                bill:{id:dataBill.id}
            })),transtionEntityManager
        )
      })
      res.status(200).json(RepositoryDTO.WithData(200,dataBill))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const update=async(req:AuthRequest,res:Response,next:NextFunction):Promise<void>=>{
    try{
      const model:IBillUpdateModel=req.body;
      const id=Number(req.params.id);
      const data=await dataService.getBy(Bill,'bill',id);
      if(await dataController.IsNotFound(res,data,"Không tìm thấy hóa đơn này")) return
      await dataService.update(Bill,data,{
        statusOrder:model.statusOrder
      })
      res.status(200).json(RepositoryDTO.Success("Cập nhập thành công hóa đơn"))
         
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}

const billController={
    create,get,remove,getAllWithFilterAndPagination,update
}
export default billController