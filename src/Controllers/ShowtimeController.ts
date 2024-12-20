import { NextFunction,Request,Response } from "express";
import { IShowtimeModel } from "../Model/ShowtimeModel";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import { IDataDeleteModel } from "../Model/dataModel";
import ShowtimeService from './../Service/ShowtimeService';

export default class ShowtimeController{
    showtimeService:ShowtimeService
    constructor(){
        this.showtimeService = new ShowtimeService()
    }
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
    async update (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const id=Number(req.params.id);
            const model:IShowtimeModel=req.body;
            this.showtimeService.update(id,model)
             res.status(200).json(RepositoryDTO.Success("Cập nhập lịch chiếu phim thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    async removeArray (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const model:IDataDeleteModel=req.body;
            this.showtimeService.removeArray(model.ids)
            res.status(200).json(RepositoryDTO.Success("Xóa lịch chiếu phim này thành công"))
         }catch(error:any){
             console.log(error)
             next(error)
         }
    }
    async createArray (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
          
            // Tạo đối tượng từ request body
            const models:IShowtimeModel[]=req.body;
            this.showtimeService.createArray(models)
            res.status(200).json(RepositoryDTO.Success("Tạo danh sách phim thành công thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
}