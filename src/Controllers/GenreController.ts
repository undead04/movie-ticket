import { NextFunction,Request,Response } from "express";
import { IGenreModel } from "../Model/GenreMode";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import {  IDataDeleteModel } from "../Model/dataModel";
import dataSource from "../DataSource";
import GenreService from "../Service/GenreService";
import { AutoBind } from "../utils/AutoBind";

export default class GenreController{
    genreService:GenreService
    constructor(){
        this.genreService= new GenreService()
    }
    @AutoBind
    async getAllWithFilterAndPagination (req:Request,res:Response):Promise<void>{
        try{
            const {name,page,pageSize,orderBy,sort}=req.query;
            const pageNumber = Number(page) || 1;
            const pageSizeNumber = Number(pageSize) || 10;
            const orderByField=orderBy as string;
            const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
            const nameString=name as string
            const data = await this.genreService.getFillter(nameString,orderByField,sortOrder,pageNumber,pageSizeNumber)
            res.status(200).json(RepositoryDTO.WithData(200,data))
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }    
    }
    @AutoBind
    async get (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const id=Number(req.params.id);
            const record=await this.genreService.getBy(id);
            res.status(200).json(RepositoryDTO.WithData(200,record))
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    
    }
    @AutoBind
    async removeArray (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const model:IDataDeleteModel=req.body;
            await dataSource.manager.transaction(async(transactionEntityManager)=>{
                await this.genreService.removeArray(model.ids,transactionEntityManager)
            })
            res.status(200).json(RepositoryDTO.Success("Xóa thể loại phim thành công"))
         }catch(error:any){
             console.log(error)
             res.status(500).json(error)
         }
    }
    @AutoBind
    async remove (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
           const id=Number(req.params.id)
           await this.genreService.remove(id)
           res.status(200).json(RepositoryDTO.Success("Xóa các thể loại phim thành công"))
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    
    }
    @AutoBind
    async createArray(req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
          
            // Tạo đối tượng từ request body
            const models:IGenreModel[]=req.body;
             await dataSource.manager.transaction(async(transactionEntityManger)=>{
                await this.genreService.createArray(models,transactionEntityManger)
             })
             res.status(200).json(RepositoryDTO.Success("Tạo thể loại phim thành công"))
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    
    }
    @AutoBind
    async create (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
          
            // Tạo đối tượng từ request body
            const model:IGenreModel=req.body;
             await this.genreService.create(model)
             res.status(200).json("Tạo thể loại phim thành công")
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async update (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const id=Number(req.params.id);
            const model:IGenreModel=req.body;
            await this.genreService.update(id,model)
             res.status(200).json("Cập nhập thể loại phim thành công")
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    
    }
}
