import { NextFunction,Request,Response } from "express";
import dataService from "../Service/DataService";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import dataController from "./DataController";
import {  IDataDeleteModel } from "../Model/dataModel";
import dataSource from "../DataSource";
import { User } from "../Data/User";
import { IPasswordModel, IUserUpdateModel } from "../Model/UserModel";
import { bcrypt } from 'bcryptjs';
import { AuthRequest } from "../Middlewares/Auth";

const getAllWithFilterAndPagination=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const {page,pageSize,orderBy,sort}=req.query;
        const pageNumber = Number(page) || 1;
        const pageSizeNumber = Number(pageSize) || 10;
        const orderByField=orderBy as string;
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";  // Đảm bảo sortOrder có giá trị hợp lệ
        let queryBuilder =(await dataService.getBuilderQuery(User))
        if(orderByField){
            queryBuilder=queryBuilder.orderBy(`user.${orderByField}`,sortOrder)
        }
        const data=await dataService.getAllPagination(User,queryBuilder,pageNumber,pageSizeNumber)
        res.status(200).json(RepositoryDTO.WithData(200,data))
        
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const get=async(req:Request,res:Response,next:NextFunction):Promise<void> =>{
    try{
        const id=Number(req.params.id);
        const record=await dataService.getBy(User,"user",id);
        if(await dataController.IsNotFound(res,record,"Không tìm thấy người dùng này"))return
        res.status(200).json(RepositoryDTO.WithData(200,record))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const removeArray=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const model:IDataDeleteModel=req.body;
        const records=await dataService.getByArray(User,"user",model.ids);
        if(await dataController.IsNotFoundArray(res,records,"Không tìm thấy người dùng này")) return
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            await dataService.removeArray(User,model.ids,transactionEntityManager)
        })
        res.status(200).json(RepositoryDTO.Success("Xóa người dùng này thành công"))
     }catch(error:any){
         console.log(error)
         res.status(500).json(error)
     }
}
const remove=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
       const id=Number(req.params.id)
       const record=await dataService.getBy(User,"user",id);
       if(await dataController.IsNotFound(res,record,"Không tìm thấy người dùng này"))return
       await dataService.remove(User,record)
       res.status(200).json(RepositoryDTO.Success("Xóa người dùng  thành công"))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const update=async(req:AuthRequest,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const id=req._id
        const model:IUserUpdateModel=req.body;
        const record=await dataService.getBy(User,"user",id);
        if(await dataController.IsNotFound(res,record,"Không tìm thấy người dùng  này")) return
        // Tạo đối tượng từ request body
        await dataService.update(User,record,{
            username:model.username,
            phone:model.phone
        })
        res.status(200).json("Cập nhập người dùng thành công")
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }

}
const updatePassword= async (req:AuthRequest,res:Response,next:NextFunction):Promise<void>=>{
        const id=req._id
        const model:IPasswordModel=req.body;
        const record=await dataService.getBy(User,"user",id);
        if(await dataController.IsNotFound(res,record,"Không tìm thấy người dùng  này")) return
        const isMatch:boolean= await bcrypt.compare(model.oldPassword,record.password_hash);
        if(!isMatch){
            res.status(400).json(RepositoryDTO.Error(400,"nhập mật khẩu sai"))
            return
        }
        if(model.oldPassword==model.newPassword){
            res.status(400).json(RepositoryDTO.Error(400,"Mật khẩu mới trùng với mật khẩu củ"))
            return
        }
        if(model.newPassword!=model.confirmPassword){
            res.status(400).json(RepositoryDTO.Error(400,"Mật khẩu xác nhận không trùng với mật khẩu mới"))
            return
        }
        // Tạo đối tượng từ request body
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(model.newPassword, salt);
        await dataService.update(User,record,{
            password_hash:hash
        })
        res.status(200).json("Cập nhập người dùng thành công")
}
const userController={
    removeArray,get,remove,getAllWithFilterAndPagination,update,updatePassword
}
export default userController