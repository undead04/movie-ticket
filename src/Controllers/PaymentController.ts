import { Request,Response,NextFunction } from "express";
import { IMomoModel, ITransactionStatus } from "../Model/MomoModel";
import { createMoMoPayment, transactionStatusOrder } from "../Service/MomoService";
import { AuthRequest } from "../Middlewares/Auth";
import dataSource from "../DataSource";
import dataService from "../Service/DataService";
import { Bill } from "../Data/Bill";
import { StatusOrder } from "../Model/BillModel";
import { PaymentStatus } from "../Model/PaymentModel";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";

const createPayment=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const model:IMomoModel=req.body;
        console.log(model)
        const data= await createMoMoPayment(model)
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
const callBackPayment=async(req:AuthRequest,res:Response,next:NextFunction):Promise<void>=>{
    try{
        
        const payload=req.body

        const dataBill=await dataService.getBy(Bill,'bill',payload.orderId,'orderCode',null)
        if(dataBill==null) return
        if(payload.resultCode!=0){
            await dataService.update(Bill,dataBill,{
                statusOrder:StatusOrder.fail
            })
            res.status(200).json(RepositoryDTO.Success("Thanh toán thất bại"))
            return
        }
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            
            await dataService.update(Bill,dataBill,{
                statusOrder:StatusOrder.complete
            },transactionEntityManager)
            
        })
        res.status(200).json(RepositoryDTO.Success("Thanh toán thành công"))
      }catch(error:any){
          console.log(error)
          res.status(500).json(error)
      }
}
const transactionStatus=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const model:ITransactionStatus=req.body
        const data= await transactionStatusOrder(model)
        const dataBill=await dataService.getBy(Bill,'bill',data.orderId,'orderCode')
        if(dataBill==null) return
        if(data.resultCode!=0){
            await dataService.update(Bill,dataBill,{
                statusOrder:StatusOrder.fail,
                paymentMethod:data.orderType,
            })
            res.status(200).json(RepositoryDTO.Success("Thanh toán thất bại"))
            return
        }
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            
            await dataService.update(Bill,dataBill,{
                statusOrder:StatusOrder.complete,
                paymentMethod:data.orderType,
                bookingTime:new Date()
            },transactionEntityManager)
        })
        res.status(200).json(RepositoryDTO.Success("Thanh toán thành công"))

    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }
}
export const paymentController={createPayment,transactionStatus,callBackPayment}