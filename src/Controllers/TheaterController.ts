import { NextFunction,Request,Response } from "express";
import { ITheaterModel } from "../Model/TheaterModel";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import { IDataDeleteModel } from "../Model/dataModel";
import TheaterService from "../Service/TheaterService";
import { AutoBind } from "../utils/AutoBind";

export default class TheaterController{
    theaterService:TheaterService
    constructor(){
        this.theaterService = new TheaterService()
    }
    @AutoBind   
    async getAllWithFilterAndPagination (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const {city,name,address,page,pageSize,orderBy,sort}=req.query;
            const pageNumber=Number(page)||1;
            const pageSizeNumber=Number(pageSize)||10;
            const orderByField=orderBy as string;
            const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";  // Đảm bảo sortOrder có giá trị hợp lệ
            const nameString=name as string
            const cityString=city as string
            const addressString = address as string
            const data = await this.theaterService.getFillter(nameString,cityString,addressString,orderByField,sortOrder,pageNumber,pageSizeNumber)
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
            const data = await this.theaterService.get(id)
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
           await this.theaterService.remove(id)
           res.status(200).json(RepositoryDTO.Success("Xóa rap chiếu phim này thành công phim thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async create (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const model:ITheaterModel=req.body
            await this.theaterService.create(model)
            res.status(200).json(RepositoryDTO.Success("Tạo rạp chiếu phim thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async update (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const id=Number(req.params.id);
            const model:ITheaterModel=req.body;
            await this.theaterService.update(id,model)
             res.status(200).json(RepositoryDTO.Success("Cập nhập rạp chiếu phim thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async removeArray (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const model:IDataDeleteModel=req.body;
            await this.theaterService.removeArray(model.ids)
            res.status(200).json(RepositoryDTO.Success("Xóa các rạp chiếu phim này thành công"))
         }catch(error:any){
             console.log(error)
             next(error)
         }
    }
    @AutoBind
    async createArray (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
          
            // Tạo đối tượng từ request body
            const models:ITheaterModel[]=req.body;
            await this.theaterService.createArray(models)
             res.status(200).json(RepositoryDTO.Success("Tạo danh sách rạp chiếu phim thành công thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async waningDelete(req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const ids = req.body.ids
            await this.theaterService.waningDelete(ids)
            res.status(200).json()
        }catch(error:any){
            console.log(error)
            next(error)
        }
    }
}
