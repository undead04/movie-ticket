import { NextFunction,Request,Response } from "express";
import { SeatArrayModel, SeatModel } from "../Model/SeatModel";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import { IDataDeleteModel } from "../Model/dataModel";
import SeatService from "../Service/SeatService";
import { AutoBind } from "../utils/AutoBind";
import { parseString } from "../utils/ConverEnum";

export default class SeatController{
    seatService:SeatService
    constructor(){
        this.seatService=new SeatService()
    }
    @AutoBind
    async getAllWithFilterAndPagination(req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const {screenId,seatNumber,orderBy,sort,page,pageSize}=req.query;
            const pageNumber = Number(page) || 1;
            const pageSizeNumber = Number(pageSize) || 10;
            const orderByField=orderBy as string;
            const screenIdNumber=Number(screenId)
            const seatNumberString = parseString(seatNumber)
            const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
            const data = await this.seatService.getFillter(screenIdNumber,seatNumberString,orderByField,sortOrder,pageNumber,pageSizeNumber)
            res.status(200).json(RepositoryDTO.WithData(200,data))
            
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async get (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
          
            const id=Number(req.params.id);
            const data =await this.seatService.get(id)
            res.status(200).json(RepositoryDTO.WithData(200,data))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async remove (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
           const id=Number(req.params.id)
            await this.seatService.remove(id)
           res.status(200).json(RepositoryDTO.Success("Xóa ghê thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async create(req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
          
            const model:SeatModel=req.body
            await this.seatService.create({
                ...model,
                screen:{id:model.screenId}
            })
            res.status(200).json(RepositoryDTO.Success("Tạo ghế thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async update (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const id=Number(req.params.id);
            const model:SeatModel=req.body;
            await this.seatService.update(id,{
                row:model.row,
                col:model.col,
                seatNumber:model.seatNumber,
                screen:{id:model.screenId}
            })
             res.status(200).json(RepositoryDTO.Success("Cập nhập ghế thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async removeArray (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const model:IDataDeleteModel=req.body;
            await this.seatService.removeArray(model.ids)
            res.status(200).json(RepositoryDTO.Success("Xóa các ghế  thành công"))
         }catch(error:any){
             console.log(error)
             next(error)
         }
    }
    @AutoBind
    async createArray (req:Request,res:Response,next:NextFunction):Promise<void> {
        try{
          
            // Tạo đối tượng từ request body
            const models:SeatArrayModel=req.body;
            const screenId = models.screenId
            await this.seatService.createArray(models.seatModel.map((model)=>({
                row:model.row,
                col:model.col,
                seatNumber:model.seatNumber,
                screen:{id:screenId}
            })))
            res.status(200).json(RepositoryDTO.Success("Tạo danh sách ghế thành"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async getStatusSeat (req:Request,res:Response,next:NextFunction):Promise<void> {
        try{
            const id:number = Number(req.params.id)
            const seatStatus = await this.seatService.getSeatStatus(id)
            res.status(200).json(RepositoryDTO.WithData(200,seatStatus))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    }
    @AutoBind
    async waningDelete(req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const ids = req.body.ids
            await this.seatService.waningDelete(ids)
            res.status(200).json()
        }catch(error:any){
            console.log(error)
            next(error)
        }
    }
}
