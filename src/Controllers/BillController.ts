import { NextFunction,Request,Response } from "express";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import { AuthRequest } from "../Middlewares/Auth";
import BillService from "../Service/BillService";
import { BillModel, BillUpdateModel } from '../Model/BillModel';
import { AutoBind } from "../utils/AutoBind";

export default class BillController{
    protected billService:BillService
    constructor(){
        this.billService = new BillService()
    }
    @AutoBind
    async getAllWithFilterAndPagination(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try{
            const {from,to,statusOrder,orderCode,orderBy,sort,page,pageSize}=req.query;
            const userId=req._id;
            const role:string=req.role
            const pageNumber = Number(page) || 1;
            const pageSizeNumber = Number(pageSize) || 10;
            const orderByField=orderBy as string;
            const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
            const orderCodeString = orderCode as string
            const fromString = from as string;
            const toString = to as string;
            const statusOrderNumber = Number(statusOrder)
            const data =await this.billService.getFillter(orderCodeString,statusOrderNumber,role,userId,fromString,toString,orderByField,sortOrder,pageNumber,pageSizeNumber)
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
           this.billService.remove(id)
            res.status(200).json(RepositoryDTO.Success("Xóa hóa đơn thành công thành công"))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async create(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try{
          const model:BillModel = req.body
        
          const userId = req._id
          const dataBill = await this.billService.create(userId,model)
          res.status(200).json(RepositoryDTO.WithData(200,dataBill))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async update (req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try{
          const model:BillUpdateModel=req.body;
          const id=Number(req.params.id);
          await this.billService.update(id,model)
          res.status(200).json(RepositoryDTO.Success("Cập nhập thành công hóa đơn"))
             
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    @AutoBind
    async get (req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try{
            const id =Number(req.params.id)
          const data =await this.billService.getId(id)
          res.status(200).json(RepositoryDTO.WithData(200,data))
             
        }catch(error:any){
            console.log(error)
            next(error)
        }
    
    }
    
}
