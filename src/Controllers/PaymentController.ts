import { Request,Response,NextFunction } from "express";
import {  ITransactionStatus, MomoModel } from "../Model/MomoModel";
import MomoService from "../Service/MomoService";
import { AuthRequest } from "../Middlewares/Auth";
import { StatusOrder } from "../Model/BillModel";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import BillService from '../Service/BillService';
import { AutoBind } from "../utils/AutoBind";

export default class PaymentController{
    protected momoService:MomoService
    protected billService:BillService
    constructor(){
        this.momoService = new MomoService()
        this.billService = new BillService()
    }
    @AutoBind
    async createPayment(req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const model:MomoModel=req.body;
            const data= await this.momoService.createMoMoPayment(model)
            if(data.resultCode!=0){
                res.status(400).json(data.message)
                return
            }
            res.status(200).json(data)
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    }
    @AutoBind
    async callBackPayment (req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try{
            
            const payload=req.body
    
            const dataBill=await this.billService.getBillCode(payload.orderCode)
            if(dataBill==null) return
            if(payload.resultCode!=0){
                await this.billService.update(dataBill.id,{
                    statusOrder:StatusOrder.fail,
                    paymentMethod:payload.orderType,
                })
                res.status(200).json(RepositoryDTO.Success("Thanh toán thất bại"))
                return
            }
            this.billService.update(dataBill.id,{
                paymentMethod:payload.orderType,
                statusOrder:StatusOrder.complete
            })
            res.status(200).json(RepositoryDTO.Success("Thanh toán thành công"))
          }catch(error:any){
              console.log(error)
              res.status(500).json(error)
          }
    }
    @AutoBind
    async transactionStatus (req:Request,res:Response,next:NextFunction):Promise<void>{
        try{
            const model:ITransactionStatus=req.body
            const data= await this.momoService.transactionStatusOrder(model)
            const dataBill=await this.billService.getBillCode(data.orderId)
            if(dataBill.statusOrder != StatusOrder.pending){
                res.json(400).json(RepositoryDTO.Error(400,"Không thể cập nhập hóa đơn nữa"));
                return
            }
            if(dataBill==null) return
            if(data.resultCode!=0){
                await this.billService.update(dataBill.id,{
                    statusOrder:StatusOrder.fail,
                    paymentMethod:data.payType,
                })
                res.status(200).json(RepositoryDTO.Success("Thanh toán thất bại"))
                return
            }
            await this.billService.update(dataBill.id,{
                statusOrder:StatusOrder.complete,
                paymentMethod:data.payType,
                bookingTime:new Date()
            })
            res.status(200).json(RepositoryDTO.Success("Thanh toán thành công"))
    
        }catch(error:any){
            console.log(error)
            res.status(500).json(error)
        }
    }
}