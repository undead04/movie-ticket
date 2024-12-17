import { NextFunction,Request,Response } from "express";
import { IScreenModel, ScreenModel } from "../Model/ScreenModel";
import dataService from "../Service/DataService";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import dataController from "./DataController";
import { Screen } from "../Data/Screen";
import { IDataDeleteModel } from "../Model/dataModel";
import dataSource from "../DataSource";
import { Ticket } from "../Data/Ticket";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";


const getAllWithFilterAndPagination=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const {theaterId,orderBy,sort,page,pageSize}=req.query;
        const pageNumber = Number(page) || 1;
        const pageSizeNumber = Number(pageSize) || 10;
        const orderByField=orderBy as string;
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        let queryBuilder =(await dataService.getBuilderQuery(Screen,"screen")).leftJoinAndSelect('screen.theater','theater')
        if(theaterId){
            queryBuilder=queryBuilder.where("screen.theaterId =:theaterId",{theaterId})
            
        }
        if(orderByField){
            queryBuilder=queryBuilder.orderBy(`screen.${orderByField}`,sortOrder)
        }
        const data=await dataService.getAllPagination(Screen,queryBuilder,pageNumber,pageSizeNumber)
        res.status(200).json(RepositoryDTO.WithData(200,data))
        
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const get=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        const id=Number(req.params.id);
        const record=await dataService.getBy(Screen,"screen",id,'id',[
            {original:"screen.theater",link:"theater"}
        ]);
        if(await dataController.IsNotFound(res,record,"Không tìm thấy phòng chiếu phim này")) return
        res.status(200).json(RepositoryDTO.WithData(200,record))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const remove=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
       const id=Number(req.params.id)
       const record=await dataService.getBy(Screen,"screen",id)
       const recordTicket=await (await dataService.getBuilderQuery(Ticket,'ticket'))
       .innerJoin('ticket.showtime',"showtime")
       .andWhere('showtime.screenId=:id',{id})
       .getOne()
       if(await dataController.IsNotFound(res,record,"Không tìm thấy phòng chiếu phim này")) return
       if(recordTicket){
        res.status(409).json(RepositoryDTO.Error(409,`Không đc xóa Phòng ${record.name} tại ${record.theater.address} bởi vì sẽ mất nhiều dữ liệu quan trộng`))
        return
       }
       await dataService.remove(Screen,record)
       res.status(200).json(RepositoryDTO.Success("Xóa phòng thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const create=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        const model:IScreenModel=req.body
        const validateError = new ScreenModel(0,model);
        if(await dataController.validateError(res,validateError)) return;
        await dataService.create(Screen,{
            ...model,
            theater:{id:model.theaterId}
        })
         res.status(200).json(RepositoryDTO.Success("Tạo phòng thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const update=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const id=Number(req.params.id);
        const model:IScreenModel=req.body;
        const data=await dataService.getBy(Screen,"screen",id)
        const validateError = new ScreenModel(id,model);
        if(await dataController.IsNotFound(res,data,"Không tìm thấy phòng này")) return
        if(await dataController.validateError(res,validateError)) return
        await dataService.update(Screen,data,{
            name:model.name,
            seatCapacity:model.seatCapacity,
            theater:{id:model.theaterId}
        })
         res.status(200).json(RepositoryDTO.Success("Cập nhập phòng thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const removeArray=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const model:IDataDeleteModel=req.body;
        const records=await dataService.getByArray(Screen,"screen",model.ids);
        const recordTicket=await (await dataService.getBuilderQuery(Ticket,'ticket'))
                .innerJoin('ticket.showtime',"showtime")
                .andWhere('showtime.screenId IN (:...id)',{id:model.ids})
                .getOne()
        if(await dataController.IsNotFoundArray(res,records,"Không tìm thấy phòng chiếu phim này")) return
        if(recordTicket){
            res.status(409).json(RepositoryDTO.Error(409,`Không đc xóa các phòng này vì sẽ mất nhiều dữ liệu quan trọng`))
            return
           }
        await dataSource.manager.transaction(async (transactionEntityManager)=>{
            await dataService.removeArray(Screen,model.ids,transactionEntityManager)
        })
        res.status(200).json(RepositoryDTO.Success("Xóa các phòng chiếu phim này thành công"))
     }catch(error:any){
         console.log(error)
         res.status(500).json(error)
     }
}
const createArray=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        // Tạo đối tượng từ request body
        const models:IScreenModel[]=req.body;
        const arrayModel=models.map(model=>({
            name:model.name.trim().toLowerCase(),
            theaterId:model.theaterId
        }))
        if(IsDuplicatesWithSort(arrayModel)){
            res.status(400).json(RepositoryDTO.Error(400,`Tạo phòng thất bại vì có model trùng nhau`))
            return
        }
        for (const model of models) {
            const validateError = new ScreenModel(0, model);  // Tạo đối tượng kiểm tra lỗi từ model
            if (await dataController.validateError(res, validateError)) return
        }
        await dataSource.manager.transaction(async (transactionEntityManager)=>{
            await dataService.createArray(Screen,models.map((model)=>({
                name:model.name,
                seatCapacity:model.seatCapacity,
                theater:{id:model.theaterId}
             })),transactionEntityManager)
        })

         res.status(200).json(RepositoryDTO.Success("Tạo danh sách phòng chiếu phim thành công thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const screenController={
    create,get,remove,getAllWithFilterAndPagination,update,createArray,removeArray,
}
export default screenController