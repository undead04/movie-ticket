import { NextFunction,Request,Response } from "express";
import { IReviewModel, ReviewModel } from "../Model/ReviewModel";
import { AuthRequest } from "../Middlewares/Auth";
import dataService from "../Service/DataService";
import { Review } from "../Data/Review";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import dataController from "./DataController";
import { IDataDeleteModel } from "../Model/dataModel";
import dataSource from "../DataSource";
import AppRole from "../Model/GroupRoleModel";
import { Ticket } from "../Data/Ticket";

const getAllWithFilterAndPagination=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const {rating,movieId,orderBy,sort,page,pageSize}=req.query;
        const pageNumber = Number(page) || 1;
        const pageSizeNumber = Number(pageSize) || 10;
        const orderByField=orderBy as string;
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        let queryBuilder =(await dataService.getBuilderQuery(Review,'review'))
        if(rating){
            queryBuilder=queryBuilder.where("review.rating = :rating",{rating})
        }
        if(movieId){
            queryBuilder=queryBuilder.andWhere('review.movieId=:movieId',{movieId})
        }
        if(orderByField){
            queryBuilder=queryBuilder.orderBy(`review.${orderByField}`,sortOrder)
        }
        const data=await dataService.getAllPagination(Review,queryBuilder,pageNumber,pageSizeNumber)
        res.status(200).json(RepositoryDTO.WithData(200,data))
        
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const get=async(req:Request,res:Response,next:NextFunction):Promise<void> =>{
    try{
      
        const id=Number(req.params.id);
        const data=await dataService.getBy(Review,'review',id);
        if(await dataController.IsNotFound(res,data,"Không tìm thấy bình luận này")) return;
        res.status(200).json(RepositoryDTO.WithData(200,data))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const remove=async(req:AuthRequest,res:Response,next:NextFunction):Promise<void>=>{
    try{
       const id=Number(req.params.id)
       const role:string=req.role
       const userId:number=req._id
       const data=await dataService.getBy(Review,"review",id,'id',[
        {
            original:"review.user",link:"user"
        }
       ])
       if(await dataController.IsNotFound(res,data,"Không tìm thấy bình luận này")) return;
       if(role==AppRole.User&&data.user.id!=userId){
         res.status(403).json(RepositoryDTO.Error(403,"Bạn không đủ quyền hạn để xóa bình luận này"))
         return
       }
        await dataService.remove(Review,data)
        res.status(200).json(RepositoryDTO.Success("Xóa bình luận thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const create=async(req:AuthRequest,res:Response,next:NextFunction):Promise<void>=>{
    try{
      
        // Tạo đối tượng từ request body
        const model:IReviewModel=req.body;
        const validateError = new ReviewModel(model);
        const userId:number=req._id
        const ticket=await (await dataService.getBuilderQuery(Ticket,'ticket')).
            innerJoin('ticket.showtime','showtime')
            .andWhere('showtime.movieId=:value',{value:model.movieId}).getOne()
        if(!ticket){
            res.status(403).json(RepositoryDTO.Error(403,"Bạn không có đủ điều kiện để bình luận phim chiếu rạp này"))
            return
        }
        if(await dataController.validateError(res,validateError)) return;
         await dataService.create(Review,{
            ...model,
            movie:{id:model.movieId},
            user:{id:userId}
         })
         res.status(200).json(RepositoryDTO.Success("Tạo bình luận thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const update=async(req:AuthRequest,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const id=Number(req.params.id);
        const model:IReviewModel=req.body;
        const data=await dataService.getBy(Review,'review',id)
        const validateError = new ReviewModel(model);
        if(await dataController.IsNotFound(res,data,"Không tìm thấy bình luận này")) return;
        if(await dataController.validateError(res,validateError)) return
        await dataService.update(Review,data,{
            comment:model.comment,
            rating:model.rating,
        })
         res.status(200).json(RepositoryDTO.Success("Cập nhập bình luận thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const removeArray=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const model:IDataDeleteModel=req.body;
        const records=await dataService.getByArray(Review,"review",model.ids);
        if(await dataController.IsNotFoundArray(res,records,"Không tìm thấy bình luận  này")) return
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            await dataService.removeArray(Review,model.ids,transactionEntityManager)
        })
        res.status(200).json(RepositoryDTO.Success("Xóa bình luận thành công"))
     }catch(error:any){
         console.log(error)
         res.status(500).json(error)
     }
}
const reviewController={
    create,get,remove,getAllWithFilterAndPagination,update,removeArray
}
export default reviewController