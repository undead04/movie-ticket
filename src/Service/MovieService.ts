import { EntityManager } from "typeorm";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";
import DataService from "./DataService";
import CustomError from "../validations/CustumError";
import { Movie } from "../Data/Movie";
import { IMovieModel } from "../Model/MovieModel";
import { MovieGenre } from "../Data/MovieGenre";
import dataSource from "../DataSource";
import { StatusMovie } from "../Controllers/MoiveController";

export default class MovieService{
    protected movieRepository: DataService<Movie>
    protected genreMovieRepository :DataService<MovieGenre>
    constructor(){
        this.movieRepository = new DataService(Movie,'movie')
        this.genreMovieRepository = new DataService(MovieGenre,'movieGenre')
    }
    async get(id:number):Promise<Movie>{
        return this.movieRepository.getBy(id)
    }
    async getFillter(title?:string,genreId?:string[],statusMovieEnum?:StatusMovie,orderBy?:string,sort?:string,page:number=1,pageSize:number=10){
        const sortOrder: "ASC" | "DESC" = (sort as "ASC" | "DESC") || "ASC";
        let queryBuilder =await this.movieRepository.createQueryBuilder()
        queryBuilder = (await queryBuilder).leftJoinAndSelect('movie.movieGenre', 'movieGenre')
                                            .leftJoinAndSelect('movieGenre.genre',"genre"); 
        if(title){
             queryBuilder=queryBuilder.where("movie.title LIKE :title",{title:`%${title}%`})
        }    
        // Lọc theo genreId từ bảng MovieGenre
        if(genreId && genreId.length > 0) {
            queryBuilder = queryBuilder.andWhere('movieGenre.genreId IN (:...genreId)', {
            genreId
            });
        }
        if(statusMovieEnum){
            const nowDate= Date.now();
            switch(statusMovieEnum){
                case StatusMovie.announcing:
                  queryBuilder=queryBuilder.andWhere('movie.releaseDate <=:value',{value:nowDate})
                  queryBuilder=queryBuilder.andWhere('movie.endDate >=:value',{value:nowDate})
                  break;
                case StatusMovie.comingSoon:
                  queryBuilder=queryBuilder.andWhere('movie.releaseDate >=:value',{value:nowDate})
                  break;
                case StatusMovie.stopShowing:
                  queryBuilder=queryBuilder.andWhere('movie.endDate <:value',{value:nowDate})
                  break;
              }
            }
        if(orderBy){
            queryBuilder=queryBuilder.orderBy(`movie.${orderBy}`,sortOrder)
        }
        const data = await this.movieRepository.getPagination(queryBuilder,page,pageSize)
        return data
    }
    protected async isUniqueName(name:string){
        const record=await this.movieRepository.getBy(name,'name')
        if(record){
            return true
        }
        return false
    }
    protected async validate(id: number, data: IMovieModel) {
        // Kiểm tra sự tồn tại của bản ghi
        const record = id ? await this.movieRepository.isNotFound(id, `Tên này không tồn tại id = ${id}`) : null;
        await Promise.all(data.genreId.map(async(genre)=>this.movieRepository.isNotFound(genre,`Id = ${genre} này không tồn tại`)))
        // Kiểm tra tên có trùng hay không
        const isNameUnique = await this.isUniqueName(data.title);
        // Nếu record là null (tức là không có bản ghi nào), kiểm tra tên
        if (record === null && isNameUnique) {
          throw new CustomError(`Tên phim ${data.title} đã tồn tại`, 400,'name');
        }
        // Nếu có bản ghi, kiểm tra nếu tên trùng với bản ghi khác, và id không giống nhau
        if (record && isNameUnique && record.id !== id) {
          throw new CustomError(`Tên phim ${data.title} đã tồn tại`, 400,'name');
        }
      }      
    async create(data: IMovieModel): Promise<void> {
        await this.validate(0,data);
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            const dataMovie = await this.movieRepository.create({
                ...data,
            },transactionEntityManager)
            await this.genreMovieRepository.createArray(data.genreId.map(genre=>({
                movie:{id:dataMovie.id},
                genre:{id:genre}
            })),transactionEntityManager)
        })
        
    }
    async createArray(
        datas: IMovieModel[],
      ): Promise<void> {
        const arrayName=datas.map(data=>({
            name:data.title
        }))
        if(IsDuplicatesWithSort(arrayName)){
            throw new CustomError(`Tạo thể loại thất bại vì có model trùng tên`,400)
        }
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
    async update(id:number,data:IMovieModel):Promise<void>{
        await this.validate(id,data);
        await dataSource.manager.transaction(async(transactionEntityManager)=>{
            const dataMovie = await this.movieRepository.update(id,{
                ...data,
            },transactionEntityManager)
            await this.genreMovieRepository.removeArray(dataMovie.movieGenre.map(genre=>genre.id))
            await this.genreMovieRepository.createArray(data.genreId.map(genre=>({
                movie:{id:dataMovie.id},
                genre:{id:genre}
            })),transactionEntityManager)
        })
    }
}