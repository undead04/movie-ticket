import { NextFunction,Request,Response } from "express";
import { IShowtimeModel } from "../Model/ShowtimeModel";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import { IDataDeleteModel } from "../Model/dataModel";
import ShowtimeService from './../Service/ShowtimeService';
import { AutoBind } from "../utils/AutoBind";

export default class ShowtimeController{
    showtimeService:ShowtimeService
    constructor(){
        this.showtimeService = new ShowtimeService()
    }
    @AutoBind
    async getAllWithFilterAndPagination (req: Request, res: Response, next: NextFunction): Promise<void>  {
        try {
            const { movieId, showDate, page, pageSize,orderBy,sort } = req.query;
            // Chuyển đổi các tham số từ query string
            const pageNumber = Number(page) || 1;
            const pageSizeNumber = Number(pageSize) || 10;
            const orderByField=orderBy as string;
            const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
            const showDateString = showDate as string
            const movieNumebr = Number(movieId)
            const data = await this.showtimeService.getFillter(showDateString,movieNumebr,orderByField,sortOrder,pageNumber,pageSizeNumber)
            res.status(200).json(RepositoryDTO.WithData(200,data));
    
        } catch (error: any) {
            console.error(error);
            next(error)
        }
    };
    
    @AutoBind
    async get (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
          
            const id=Number(req.params.id);
            const data = await this.showtimeService.get(id)
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
           await this.showtimeService.remove(id)
            res.status(200).json(RepositoryDTO.Success("Xóa thời gian chiếu phim thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async create (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
          
            const model:IShowtimeModel = req.body
            await this.showtimeService.create(model)
            res.status(200).json(RepositoryDTO.Success("Tạo thời gian thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async update (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const id=Number(req.params.id);
            const model:IShowtimeModel=req.body;
            await this.showtimeService.update(id,model)
             res.status(200).json(RepositoryDTO.Success("Cập nhập lịch chiếu phim thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async removeArray (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const model:IDataDeleteModel=req.body;
            await this.showtimeService.removeArray(model.ids)
            res.status(200).json(RepositoryDTO.Success("Xóa các lịch chiếu phim này thành công"))
         }catch(error:any){
             console.log(error)
             next(error)
         }
    }
    @AutoBind
    async createArray (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
          
            // Tạo đối tượng từ request body
            const models:IShowtimeModel[]=req.body;
            await this.showtimeService.createArray(models)
            res.status(200).json(RepositoryDTO.Success("Tạo danh sách thời gian phim thành công thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async waningDelete(req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const ids = req.body.ids
            await this.showtimeService.waningDelete(ids)
            res.status(200).json()
        }catch(error:any){
            console.log(error)
            next(error)
        }
    }
}