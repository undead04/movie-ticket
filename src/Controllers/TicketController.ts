import {  NextFunction, Response } from "express";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import { AuthRequest } from "../Middlewares/Auth";
import TicketService from "../Service/TicketService";
import { AutoBind } from "../utils/AutoBind";

export default class TicketController{
    protected ticketService:TicketService
    constructor(){
        this.ticketService = new TicketService()
    }
    @AutoBind
    async getTicket (req:AuthRequest,res:Response,next:NextFunction){
        try{
            const movieId = req.query.movieId;
            const billId = req.params.billId
            const userId = req._id
            const role = req.role
            const data = await this. ticketService.getFillter(Number(billId),Number(movieId),role,userId)
            res.status(200).json(RepositoryDTO.WithData(200,data))
        }catch(error:any){
            console.log(error)
            next(error)
        }
    }
}