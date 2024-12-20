import { NextFunction,Request,Response } from "express";
import { IScreenModel, ScreenModel } from "../Model/ScreenModel";
import dataService from "../Service/DataService";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import { Screen } from "../Data/Screen";
import { IDataDeleteModel } from "../Model/dataModel";
import dataSource from "../DataSource";
import { Ticket } from "../Data/Ticket";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";
import ScreenServie from "../Service/ScreenService";

export default class ScreenController{
    screenService:ScreenServie
    constructor(){
        this.screenService=new ScreenServie()
    }
    async getAllWithFilterAndPagination (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const {theaterId,orderBy,sort,page,pageSize}=req.query;
            const pageNumber = Number(page) || 1;
            const pageSizeNumber = Number(pageSize) || 10;
            const orderByField=orderBy as string;
            const theaterIdNumber=Number(theaterId)
            const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
            const data =await this.screenService.getFillter(theaterIdNumber,orderByField,sortOrder,pageNumber,pageSizeNumber)
            res.status(200).json(RepositoryDTO.WithData(200,data))
            
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    
    }
    async get(req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
          
            const id=Number(req.params.id);
            const record = await this.screenService.getBy(id)
            res.status(200).json(RepositoryDTO.WithData(200,record))
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    
    }
    async remove (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
           const id=Number(req.params.id)
           await this.screenService.remove(id)
            res.status(200).json(RepositoryDTO.Success("Xóa phòng thành công"))
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    
    }
    async create (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
          
            const model:IScreenModel=req.body
            await this.screenService.create({
                ...model,
                theater:{id:model.theaterId}
            })
            res.status(200).json(RepositoryDTO.Success("Tạo phòng chiếu phim thành công"))
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    
    }
    async update (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const id=Number(req.params.id);
            const model:IScreenModel=req.body;
            await this.screenService.update(id,{
                name:model.name,
                seatCapacity:model.seatCapacity,
                theater:{id:model.theaterId}
            })
             res.status(200).json(RepositoryDTO.Success("Cập nhập phòng chiếu phim thành công"))
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    
    }
    async removeArray (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const model:IDataDeleteModel=req.body;
            await dataSource.manager.transaction(async (transactionEntityManager)=>{
                await this.screenService.removeArray(model.ids,transactionEntityManager)
            })
            res.status(200).json(RepositoryDTO.Success("Xóa các phòng chiếu phim này thành công"))
         }catch(error:any){
             console.log(error)
             res.status(500).json(error)
         }
    }
    async createArray (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
          
            // Tạo đối tượng từ request body
            const models:IScreenModel[]=req.body;
            await dataSource.manager.transaction(async (transactionEntityManager)=>{
                await this.screenService.createArray(models.map((model)=>({
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
}

