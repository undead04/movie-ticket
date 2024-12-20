
import { DeepPartial } from "typeorm";
import { Review } from "../Data/Review";
import { IShowtimeModel } from "../Model/ShowtimeModel";
import CustomError from "../validations/CustumError";
import DataService from "./DataService";
import { Movie } from "../Data/Movie";
import { Ticket } from "../Data/Ticket";

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
        return this.reviewRepository.getBy(id)
    }
    async getFillter(rating?:number,movieId?:number,orderBy?:string,sort?:string,page:number=1,pageSize:number=10){
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        let queryBuilder = await this.reviewRepository.createQueryBuilder()
        if(rating){
            queryBuilder=queryBuilder.where("review.rating =:rating",{rating})
        }
        if(movieId){
             queryBuilder=queryBuilder.andWhere('review.movieId=:movieId',{movieId})
        }
        if(orderBy){
            queryBuilder=queryBuilder.orderBy(`review.${orderBy}`,sortOrder)
        }
        const data=await this.reviewRepository.getPagination(queryBuilder,page,pageSize)
        return data
    }
    protected async isUnique(data:DeepPartial<Review>){
        const record = await (await this.reviewRepository
        .createQueryBuilder())
        .where('review.userId = :userId', { userId: data.user.id })
        .andWhere('review.movieId = :movie', { screenId: data.movie.id })
        .getOne();

        if(record){
            return true
        }
        return false
    }
    protected async validate(id: number, data: DeepPartial<Review>) {
        // Kiểm tra sự tồn tại của bản ghi
        const record = id ? await this.reviewRepository.isNotFound(id, `thời gian này không tồn tại id = ${id}`) : null;
        const movieRecord = await this.movieRepository.isNotFound(data.movie.id,`Phim này không tồn tại id = ${id}`,400,"movieId")
        // Kiểm tra tên có trùng hay không
        const isUnique = await this.isUnique(data);
        // Nếu record là null (tức là không có bản ghi nào), kiểm tra tên
        if (record === null && isUnique) {
          throw new CustomError(`Phim ${movieRecord.title} này đã đc bình luận rồi không đc bình luận nữa`, 400,'name');
        }
        const ticket=await (await this.ticketRepository.createQueryBuilder()).
                    innerJoin('ticket.showtime','showtime')
                    .andWhere('showtime.movieId=:value',{value:data.movie.id}).getOne()
        if(!ticket){
            throw new CustomError("Bạn không có đủ điều kiện để bình luận phim chiếu rạp này",400)
        }
      }      
    async create(data: DeepPartial<Review>): Promise<void> {
        await this.validate(0,data);
        await this.reviewRepository.create(data)
    }
    async createArray(
        datas: DeepPartial<Review>[],
      ): Promise<void> {
        await Promise.all(datas.map(async(data)=>{
            await this.create(data)
        })) 
      }
    async remove(id:number):Promise<void>{
        await this.movieRepository.remove(id)
    }
    async removeArray(ids:number[]):Promise<void>{
        await this.movieRepository.removeArray(ids)
    }
    async update(id:number,data:DeepPartial<Review>):Promise<void>{
        await this.movieRepository.update(id,data)
    }
}