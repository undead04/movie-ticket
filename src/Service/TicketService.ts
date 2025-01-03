
import DataService from "./DataService";
import { Ticket } from "../Data/Ticket";
import AppRole from "../Model/GroupRoleModel";

export default class TicketService{
    protected ticketRepository:DataService<Ticket>
    constructor(){
        this.ticketRepository = new DataService(Ticket,'ticket')
    }
    async getFillter(billId:number,movieId:number,role:string,userId:number){
        let queryBuilder = (await this.ticketRepository.createQueryBuilder())
        .leftJoinAndSelect('ticket.showtime','showtime')
        .leftJoinAndSelect('ticket.bill','bill')
        if(billId){
            queryBuilder = queryBuilder.andWhere('ticket.billId =:billId',{billId})
        }
        if(movieId){
            queryBuilder = queryBuilder.andWhere('showtime.movieId=:movieId',{movieId})
        }
        if(role==AppRole.User){
             queryBuilder=queryBuilder.andWhere('bill.userId=:value',{value:userId})
        }
        const data = this.ticketRepository.getPagination(queryBuilder,1,10)
        return data
    }
}