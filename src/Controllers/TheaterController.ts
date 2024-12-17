import { NextFunction,Request,Response } from "express";
import { ITheaterModel, TheaterModel } from "../Model/TheaterModel";
import dataService from "../Service/DataService";
import { Theater } from "../Data/Theater";
import dataController from "./DataController";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import { IDataDeleteModel } from "../Model/dataModel";
import dataSource from "../DataSource";
import { Ticket } from "../Data/Ticket";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";


const getAllWithFilterAndPagination=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const {city,name,address,page,pageSize,orderBy,sort}=req.query;
        const pageNumber=Number(page)||1;
        const pageSizeNumber=Number(pageSize)||10;
        const orderByField=orderBy as string;
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";  // Đảm bảo sortOrder có giá trị hợp lệ
        let queryBuilder =(await dataService.getBuilderQuery(Theater))
        if(city){
            queryBuilder=queryBuilder.where("theater.city = :city",{city})
        }
        if(address){
            queryBuilder=queryBuilder.andWhere('theater.address LIKE :address',{address:`%${address}%`})
        }
        if(name){
            queryBuilder=queryBuilder.andWhere('theater.name LIKE:name',{name:`%${name}%`})
        }
        if(orderByField){
            queryBuilder=queryBuilder.orderBy(`theater.${orderByField}`,sortOrder)
        }
        const data=await dataService.getAllPagination(Theater,queryBuilder,pageNumber,pageSizeNumber)
        res.status(200).json(RepositoryDTO.WithData(200,data))
        
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const get=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const id=Number(req.params.id);
        const data=await dataService.getBy(Theater,"theater",id);
        if(await dataController.IsNotFound(res,data,"Không tìm thấy rạp chiếu phim này")) return
        res.status(200).json(RepositoryDTO.WithData(200,data))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const remove=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
       const id=Number(req.params.id)
       const record=await dataService.getBy(Theater,"theater",id,'id')
       const recordTicket=await (await dataService.getBuilderQuery(Ticket,'ticket'))
       .innerJoin('ticket.showtime',"showtime")
       .innerJoin('showtime.screen','screen')
       .andWhere('screen.theaterId=:id',{id})
       .getOne()
       if(await dataController.IsNotFound(res,record,"Không tìm thấy rạp chiếu phim này")) return
       if(recordTicket){
        res.status(409).json(RepositoryDTO.Error(409,"Không đc xóa rạp chiếu phim này bởi vì sẽ mất nhiều dữ liệu quan trộng"))
        return
       }
       await dataService.remove(Theater,record)
       res.status(200).json(RepositoryDTO.Success("Xóa rap chiếu phim này thành công phim thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const create=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        const model:ITheaterModel=req.body
        // Tạo đối tượng từ request body
        const validateError = new TheaterModel(0,model);
        if(await dataController.validateError(res,validateError)) return;
        await dataService.create(Theater,model)
         res.status(200).json(RepositoryDTO.Success("Tạo rạp chiếu phim thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const update=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const id=Number(req.params.id);
        const model:ITheaterModel=req.body;
        const data=await dataService.getBy(Theater,"theater",id)
        const validateError = new TheaterModel(id,model);
        if(await dataController.IsNotFound(res,data,"Không tìm thấy rạp chiếu phim này")) return
        if(await dataController.validateError(res,validateError)) return
        await dataService.update(Theater,data,model)
         res.status(200).json(RepositoryDTO.Success("Cập nhập rạp chiếu phim thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const removeArray=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const model:IDataDeleteModel=req.body;
        const records=await dataService.getByArray(Theater,"theater",model.ids);
        const recordTicket=await (await dataService.getBuilderQuery(Ticket,'ticket'))
       .innerJoin('ticket.showtime',"showtime")
       .innerJoin('showtime.screen','screen')
       .andWhere('screen.theaterId IN (:...id)',{id:model.ids})
       .getOne()
        if(await dataController.IsNotFoundArray(res,records,"Không tìm thấy rạp chiếu phim này")) return
        if(recordTicket){
            res.status(409).json(RepositoryDTO.Error(409,"Không đc xóa rạp chiếu phim này bởi vì sẽ mất nhiều dữ liệu quan trộng"))
        return
        }
        await dataSource.manager.transaction(async (transactionEntityManager)=>{
            await dataService.removeArray(Theater,model.ids,transactionEntityManager)
        })
        res.status(200).json(RepositoryDTO.Success("Xóa các rạp chiếu phim này thành công"))
     }catch(error:any){
         console.log(error)
         res.status(500).json(error)
     }
}
const createArray=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        // Tạo đối tượng từ request body
        const models:ITheaterModel[]=req.body;
        const arrayName=models.map(model=>model.name.trim().toLowerCase())
        if(IsDuplicatesWithSort(arrayName)){
            res.status(400).json(RepositoryDTO.Error(400,`Tạo địa chỉ thất bại vì có  model có trùng tên`))
            return
        }
        for (const model of models) {
            const validateError = new TheaterModel(0, model);  // Tạo đối tượng kiểm tra lỗi từ model
            if (await dataController.validateError(res, validateError)) return
        }
         
         await dataSource.manager.transaction(async (transactionEntityManager)=>{
            await dataService.createArray(Theater,models,transactionEntityManager)
        })
         res.status(200).json(RepositoryDTO.Success("Tạo danh sách rạp chiếu phim thành công thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const theaterController={
    create,get,remove,getAllWithFilterAndPagination,createArray,removeArray,update
}
export default theaterController