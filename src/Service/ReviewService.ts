
import { DeepPartial, EntityManager } from "typeorm";
import { Review } from "../Data/Review";
import CustomError from "../validations/CustumError";
import DataService from "./DataService";
import { Movie } from "../Data/Movie";
import { Ticket } from "../Data/Ticket";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";
import dataSource from "../DataSource";
import AppRole from "../Model/GroupRoleModel";
import { StatusOrder } from '../Model/BillModel';

export default class ReviewService{
    protected reviewRepository:DataService<Review>
    protected movieRepository:DataService<Movie>
    protected ticketRepository:DataService<Ticket>
    constructor(){
        this.reviewRepository = new DataService(Review,'review')
        this.movieRepository = new DataService(Movie,'movie')
        this.ticketRepository = new DataService(Ticket,'ticket')
    }
    async get(id:number):Promise<Review>{
        const data = await this.reviewRepository.getBy(id,'id',[
            {original:"review.user",link:"user"}
        ],['review.id','review.comment','review.rating','user.id','user.username'])
        return data
    }
    async getFillter(userId?:number,role?:string,rating?:number,movieId?:number,orderBy?:string,sort?:string,page:number=1,pageSize:number=10){
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        let queryBuilder = await (await this.reviewRepository.createQueryBuilder())
        .leftJoinAndSelect('review.user','user')
        if(rating){
            queryBuilder=queryBuilder.where("review.rating =:rating",{rating})
        }
        if(movieId){
             queryBuilder=queryBuilder.andWhere('review.movieId=:movieId',{movieId})
        }
        if(userId&&role == AppRole.User){
            queryBuilder = queryBuilder.andWhere('review.userId =:userId',{userId:userId})
        }
        if(orderBy){
            queryBuilder=queryBuilder.orderBy(`review.${orderBy}`,sortOrder)
        }
        queryBuilder = queryBuilder.select(['review.id','review.comment','review.rating','user.id','user.username'])
        const data=await this.reviewRepository.getPagination(queryBuilder,page,pageSize)
        return data
    }
    protected async isUnique(data:DeepPartial<Review>){
        const record = await (await this.reviewRepository
        .createQueryBuilder())
        .where('review.userId = :userId', { userId: data.user.id })
        .andWhere('review.movieId = :movie', { movie: data.movie.id })
        .getOne();

        if(record){
            return record
        }
    }
    protected async validateReview(id:number){
        const record = await this.get(id)
        if(record){
            return record
        }
        throw new CustomError(`Không tìm thấy review này id =${id}`,404)
        
    }
    protected async validateMovie(id:number){
        return await this.movieRepository.isNotFound(id,`Phim này không tồn tại id = ${id}`,400,"movieId")
    }
    protected async validate(id: number, data: DeepPartial<Review>) {
        // Kiểm tra sự tồn tại của bản ghi
        if(id) await this.validateReview(id)
        const movieRecord = await this.validateMovie(data.movie.id)
        // Kiểm tra tên có trùng hay không
        const record = await this.isUnique(data);
        // Nếu record là null (tức là không có bản ghi nào), kiểm tra tên
        if (record && record.id!==id) {
          throw new CustomError(`Phim ${movieRecord.title} này đã đc bình luận rồi không đc bình luận nữa`, 400,'name');
        }
        const ticket=await (await this.ticketRepository.createQueryBuilder()).
                    innerJoin('ticket.showtime','showtime')
                    .innerJoin('ticket.bill','bill')
                    .andWhere(`bill.statusOrder =:statusOrder`,{statusOrder:StatusOrder.complete})
                    .andWhere('showtime.movieId=:value',{value:data.movie.id}).getOne()
        if(!ticket){
            throw new CustomError("Bạn không có đủ điều kiện để bình luận phim chiếu rạp này",400)
        }
      }      
    async create(data: DeepPartial<Review>): Promise<void> {
        await this.validate(0,data);
        await this.reviewRepository.create(data)
    }
    async remove(id:number,transactionEntityManager?:EntityManager){
        await this.validateReview(id)
        await this.reviewRepository.remove(id,transactionEntityManager)
    }
    async removeArray(ids:number[]){
        if(IsDuplicatesWithSort(ids)){
            throw new CustomError(`Trong req.body có hai id trùng nhau`,404)
        } 
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            for(const id of ids){
                await this.remove(id,transactionEntityManager)
            }
        })
    }
    async update(id:number,data:DeepPartial<Review>):Promise<void>{
        const record = await this.validateReview(id)
        if(record.user.id !== data.user.id){
            throw new Error("Bạn không có thẩm quyền để cập nhập")
        }
        await this.movieRepository.update(id,data)
    }
    
}