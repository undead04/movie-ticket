import { NextFunction,Request,Response } from "express";
import { IMovieModel } from "../Model/MovieModel";
import { parseStatusMovie } from "../utils/ConverEnum";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import { IDataDeleteModel } from "../Model/dataModel";
import MovieService from "../Service/MovieService";

export  enum StatusMovie{
    noStatus=0,
    announcing=1,
    comingSoon=2,
    stopShowing=3,
  }

export default class MovieController{
    movieService:MovieService
    constructor(){
        this.movieService = new MovieService()
    }
    async getAllWithFilterAndPagination(req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const { title, genreId,orderBy,sort, statusMovie,page, pageSize } = req.query;
            const genreIdArray = genreId  ? genreId.toString().split(',') : undefined;
            // Chuyển giá trị `page` và `pageSize` sang kiểu số và đảm bảo mặc định là 1 và 10 nếu không có trong query
            const pageNumber = Number(page) || 1;
            const pageSizeNumber = Number(pageSize) || 10;
            const statusMovieEnum:StatusMovie=parseStatusMovie(statusMovie)
            const orderByField=orderBy as string;
            const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
            const titleString = title as string
            const data = await this.movieService.getFillter(titleString,genreIdArray,statusMovieEnum,orderByField,sortOrder,pageNumber,pageSizeNumber)
            // Trả dữ liệu về cho client
            res.status(200).json(RepositoryDTO.WithData(200,data));
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    }
    async get (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
          
            const id=Number(req.params.id);
            const data = await this.movieService.get(id)
            res.status(200).json(RepositoryDTO.WithData(200,data))
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    
    }
    async remove (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const id:number = Number(req.params.id)
           this.movieService.remove(id)
            res.status(200).json(RepositoryDTO.Success("Xóa phim thành công"))
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    
    }
    async create (req:Request,res:Response,next:NextFunction):Promise<void> {
        try{
            const model:IMovieModel=req.body;
            this.movieService.create(model)
            res.status(200).json(RepositoryDTO.Success("Tạo phim thành công"))
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    
    }
    async update (req:Request,res:Response,next:NextFunction):Promise<void> {
        try{
            const id=Number(req.params.id);
            const model:IMovieModel=req.body;
            this.movieService.update(id,model)
            res.status(200).json(RepositoryDTO.Success("Cập nhập phim thành công"))
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    
    }
    async removeArray (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const model:IDataDeleteModel=req.body;
            this.movieService.removeArray(model.ids)
            res.status(200).json(RepositoryDTO.Success("Xóa phim này thành công"))
         }catch(error:any){
             console.log(error)
             res.status(500).json(error)
         }
    }
    async createArray (req:Request,res:Response,next:NextFunction):Promise<void> {
        try{
          
            // Tạo đối tượng từ request body
            const models:IMovieModel[]=req.body;
            this.movieService.createArray(models)
            res.status(200).json(RepositoryDTO.Success("Tạo danh sách  phim thành công thành công"))
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    
    }
}
