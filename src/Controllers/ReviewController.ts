import { NextFunction,Request,Response } from "express";
import { AuthRequest } from "../Middlewares/Auth";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import { IDataDeleteModel } from "../Model/dataModel";
import ReviewService from '../Service/ReviewService'
import { ReviewModel, ReviewUpdateModel } from "../Model/ReviewModel";
import { AutoBind } from "../utils/AutoBind";
export default class ReviewController{
    protected reviewService:ReviewService
    constructor(){
        this.reviewService = new ReviewService()
        
    }
@AutoBind    
async getAllWithFilterAndPagination (req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
    try{
        const {rating,movieId,orderBy,sort,page,pageSize}=req.query;
        const pageNumber = Number(page) || 1;
        const pageSizeNumber = Number(pageSize) || 10;
        const orderByField=orderBy as string;
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        const ratingNumber = Number(rating)
        const movieIdNumber = Number(movieId)
        const id = req._id
        const role = req.role
        const data = await this.reviewService.getFillter(id,role,ratingNumber,movieIdNumber,orderByField,sortOrder,pageNumber,pageSizeNumber)
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
        const data = await this.reviewService.get(id)
        res.status(200).json(RepositoryDTO.WithData(200,data))
    }catch(error:any){
        console.log(error)
        next(error)
    }

}
@AutoBind
async remove (req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
    try{
       const id=Number(req.params.id)
       const role:string=req.role
       const userId:number=req._id
        await this.reviewService.remove(id)
        res.status(200).json(RepositoryDTO.Success("Xóa bình luận thành công"))
    }catch(error:any){
        console.log(error)
        next(error)
    }

}
@AutoBind
async create (req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
    try{
      
        // Tạo đối tượng từ request body
        const model:ReviewModel=req.body;
        const userId = req._id
         await this.reviewService.create({
            ...model,
            movie:{id:model.movieId},
            user:{id:userId}
         })
         res.status(200).json(RepositoryDTO.Success("Tạo bình luận thành công"))
    }catch(error:any){
        console.log(error)
        next(error)
    }

}
@AutoBind
async update (req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
    try{
        const id=Number(req.params.id);
        const model:ReviewUpdateModel=req.body;
        this.reviewService.update(id,model)
         res.status(200).json(RepositoryDTO.Success("Cập nhập bình luận thành công"))
    }catch(error:any){
        console.log(error)
        next(error)
    }

}
@AutoBind
async removeArray (req:Request,res:Response,next:NextFunction):Promise<void>{
    try{
        const model:IDataDeleteModel=req.body;
        this.reviewService.removeArray(model.ids)
        res.status(200).json(RepositoryDTO.Success("Xóa các bình luận thành công"))
     }catch(error:any){
         console.log(error)
         next(error)
     }
}

}