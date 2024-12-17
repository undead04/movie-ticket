import { NextFunction,Request,Response } from "express";
import {  GenreModel, IGenreModel } from "../Model/GenreMode";
import dataService from "../Service/DataService";
import { Genre } from "../Data/Genre";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import dataController from "./DataController";
import {  IDataDeleteModel } from "../Model/dataModel";
import dataSource from "../DataSource";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";

const getAllWithFilterAndPagination=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const {name,page,pageSize,orderBy,sort}=req.query;
        const pageNumber = Number(page) || 1;
        const pageSizeNumber = Number(pageSize) || 10;
        const orderByField=orderBy as string;
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";  // Đảm bảo sortOrder có giá trị hợp lệ
        let queryBuilder =(await dataService.getBuilderQuery(Genre))
        if(name){
          queryBuilder=queryBuilder.where("genre.name LIKE :name",{name:`%${name}%`})
        }
        if(orderByField){
            queryBuilder=queryBuilder.orderBy(`genre.${orderByField}`,sortOrder)
        }
        const data=await dataService.getAllPagination(Genre,queryBuilder,pageNumber,pageSizeNumber)
        res.status(200).json(RepositoryDTO.WithData(200,data))
        
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const get=async(req:Request,res:Response,next:NextFunction):Promise<void> =>{
    try{
        const id=Number(req.params.id);
        const record=await dataService.getBy(Genre,"genre",id);
        if(await dataController.IsNotFound(res,record,"Không tìm thấy thể loại phim này"))return
        res.status(200).json(RepositoryDTO.WithData(200,record))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const removeArray=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const model:IDataDeleteModel=req.body;
        const records=await dataService.getByArray(Genre,"genre",model.ids);
        if(await dataController.IsNotFoundArray(res,records,"Không tìm thấy thể loại phim này")) return
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            await dataService.removeArray(Genre,model.ids,transactionEntityManager)
        })
        res.status(200).json(RepositoryDTO.Success("Xóa thể loại phim thành công"))
     }catch(error:any){
         console.log(error)
         res.status(500).json(error)
     }
}
const remove=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
       const id=Number(req.params.id)
       const record=await dataService.getBy(Genre,"genre",id);
       if(await dataController.IsNotFound(res,record,"Không tìm thấy thể loại phim này"))return
       await dataService.remove(Genre,record)
       res.status(200).json(RepositoryDTO.Success("Xóa các thể loại phim thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const createArray=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        // Tạo đối tượng từ request body
        const models:IGenreModel[]=req.body;
        const arrayName=models.map(model=>model.name.trim().toLowerCase())
        if(IsDuplicatesWithSort(arrayName)){
            res.status(400).json(RepositoryDTO.Error(400,`Tạo thể loại thất bại vì có model trùng tên`))
            return
        }
        for (const model of models) {
            const validateError = new GenreModel(0, model);  // Tạo đối tượng kiểm tra lỗi từ model
            if (await dataController.validateError<GenreModel>(res, validateError)) return
        }
         await dataSource.manager.transaction(async(transactionEntityManger)=>{
            await dataService.createArray(Genre,models,transactionEntityManger)
         })
         res.status(200).json(RepositoryDTO.Success("Tạo thể loại phim thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const create=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        // Tạo đối tượng từ request body
        const model:IGenreModel=req.body;
        const validateError = new GenreModel(0,model);
        if(await dataController.validateError<GenreModel>(res,validateError)) return
         await dataService.create(Genre,model)
         res.status(200).json("Tạo thể loại phim thành công")
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const update=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const id=Number(req.params.id);
        const model:IGenreModel=req.body;
        const record=await dataService.getBy(Genre,"genre",id);
        if(await dataController.IsNotFound(res,record,"Không tìm thấy thể loại phim này")) return
        // Tạo đối tượng từ request body
        const validateError = new GenreModel(id,model);
        if(await dataController.validateError(res,validateError)) return
        await dataService.update(Genre,record,model)
         res.status(200).json("Cập nhập thể loại phim thành công")
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const genreController={
    create,createArray,removeArray,get,remove,getAllWithFilterAndPagination,update
}
export default genreController