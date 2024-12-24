import { NextFunction,Request,Response } from "express";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import { PasswordModel, UserUpdateModel } from "../Model/UserModel";
import { AuthRequest } from "../Middlewares/Auth";
import UserService from "../Service/UserService";
import { AutoBind } from "../utils/AutoBind";

export default class UserController{
    protected userService:UserService
    constructor(){
        this.userService = new UserService()
    }
    @AutoBind
    async getAllWithFilterAndPagination(req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const {page,pageSize,orderBy,sort}=req.query;
            const pageNumber = Number(page) || 1;
            const pageSizeNumber = Number(pageSize) || 10;
            const orderByField=orderBy as string;
            const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";  // Đảm bảo sortOrder có giá trị hợp lệ
            const data=await this.userService.getFillter(orderByField,sortOrder,pageNumber,pageSizeNumber)
            res.status(200).json(RepositoryDTO.WithData(200,data))
            
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async get(req:Request,res:Response,next:NextFunction):Promise<void> {
        try{
            const id=Number(req.params.id);
            const record = await this.userService.get(id)
            res.status(200).json(RepositoryDTO.WithData(200,record))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async update(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try{
            const id=req._id
            const model:UserUpdateModel=req.body;
            await this.userService.update(id,model)
            res.status(200).json(RepositoryDTO.Success("Cập nhập người dùng thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async updatePassword (req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
            try{
                const id=req._id
                const model:PasswordModel=req.body;
                await this.userService.updatePassword(id,model)
            res.status(200).json(RepositoryDTO.Success("Cập nhập người dùng thành công"))
            }catch(error:any){
                console.log(error)
                next(error)
            }
    }
    @AutoBind
    async userGetMy(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try{
            const id=req._id
            console.log(id)
            const data = await this.userService.get(id);
            res.status(200).json(data)
        }catch(error:any){
            console.log(error)
            next(error)
        }
    }
}
