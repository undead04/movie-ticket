import {  Response } from "express";
import dataService from "../Service/DataService";
import { Ticket } from "../Data/Ticket";
import { RepositoryDTO } from "../Model/DTO/RepositoryDTO";
import { AuthRequest } from "../Middlewares/Auth";
import AppRole from "../Model/GroupRoleModel";

const get=async(req:AuthRequest,res:Response):Promise<void>=>{
    try{
        const {movieId}=req.query;
        const userId=req._id
        const role=req.role
        let queryBuilder=await (await dataService.getBuilderQuery(Ticket,'ticket'))
            .leftJoinAndSelect('ticket.showtime','showtime')
            .leftJoinAndSelect("ticket.seat",'seat')
            .innerJoin('ticket.bill','bill')
        
        if(movieId){
            queryBuilder=queryBuilder.andWhere('showtime.movieId=:movieId',{movieId})
        }
        if(role==AppRole.User){
            queryBuilder=queryBuilder.andWhere('bill.userId=:value',{value:userId})
        }
        const data=await queryBuilder.getMany()
        res.status(200).json(RepositoryDTO.WithData(200,data))
    }catch(error:any){
        console.log(error)
        res.status(500).json(error)
    }
}
const ticketController={get}
export default ticketController