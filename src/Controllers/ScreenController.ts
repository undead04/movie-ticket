import { NextFunction,Request,Response } from "express";
import { IScreenModel } from "../Model/ScreenModel";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import { IDataDeleteModel } from "../Model/dataModel";
import ScreenServie from "../Service/ScreenService";
import { AutoBind } from "../utils/AutoBind";

export default class ScreenController{
    screenService:ScreenServie
    constructor(){
        this.screenService=new ScreenServie()
    }
    @AutoBind
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
            next(error)
        }
    
    }
    @AutoBind
    async get(req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
          
            const id=Number(req.params.id);
            const record = await this.screenService.get(id)
            res.status(200).json(RepositoryDTO.WithData(200,record))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async remove (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
           const id=Number(req.params.id)
           await this.screenService.remove(id)
            res.status(200).json(RepositoryDTO.Success("Xóa phòng thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
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
            next(error)
        }
    
    }
    @AutoBind
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
            next(error)
        }
    
    }
    @AutoBind
    async removeArray (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const model:IDataDeleteModel=req.body;
            await this.screenService.removeArray(model.ids)
            res.status(200).json(RepositoryDTO.Success("Xóa các phòng chiếu phim này thành công"))
         }catch(error:any){
             console.log(error)
             next(error)
         }
    }
    @AutoBind
    async createArray (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
          
            // Tạo đối tượng từ request body
            const models:IScreenModel[]=req.body;
            await this.screenService.createArray(models.map((model)=>({
                name:model.name,
                seatCapacity:model.seatCapacity,
                theater:{id:model.theaterId}
             })))
             res.status(200).json(RepositoryDTO.Success("Tạo danh sách phòng chiếu phim thành công thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
        async waningDelete(req:Request,res:Response,next:NextFunction):Promise<void>{
            try{
                const ids = req.body.ids
                await this.screenService.waningDelete(ids)
                res.status(200).json()
            }catch(error:any){
                console.log(error)
                next(error)
            }
        }
}

