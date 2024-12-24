
import { IsDuplicatesWithSort } from "../utils/GenerationCode";
import DataService from "./DataService";
import CustomError from "../validations/CustumError";
import { Movie } from "../Data/Movie";
import { IMovieModel } from "../Model/MovieModel";
import { MovieGenre } from "../Data/MovieGenre";
import dataSource from "../DataSource";
import { StatusMovie } from "../Controllers/MoiveController";
import { EntityManager } from "typeorm";
import { Genre } from "../Data/Genre";

export default class MovieService{
    protected movieRepository: DataService<Movie>
    protected genreMovieRepository :DataService<MovieGenre>
    protected genreRepository: DataService<Genre>
    constructor(){
        this.movieRepository = new DataService(Movie,'movie')
        this.genreMovieRepository = new DataService(MovieGenre,'movieGenre')
        this.genreRepository = new DataService(Genre,'genre')
    }
    async get(id:number):Promise<Movie>{
        return this.movieRepository.getBy(id,'id',[{
            original:'movie.movieGenre',link:"movieGenre"
        },{original:"movieGenre.genre",link:"genre"}
    ],['movie.id', // Thêm dòng này để đảm bảo movie.id có sẵn
            'movie.title',
            'movie.description',
            'movie.duration',
            'movie.trailerUrl',
            'movie.releaseDate',
            'movie.endDate',
            'movie.posterUrl',
            'movie.createdAt',
            'movieGenre',
            'genre.name',
            'genre.id'
            ])
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
        queryBuilder = queryBuilder.select([
            'movie.id', // Thêm dòng này để đảm bảo movie.id có sẵn
            'movie.title',
            'movie.description',
            'movie.duration',
            'movie.trailerUrl',
            'movie.releaseDate',
            'movie.endDate',
            'movie.posterUrl',
            'movie.createdAt',
            'movieGenre',
            'genre.name',
            'genre.id'
            
        ]);
        
        const data = await this.movieRepository.getPagination(queryBuilder,page,pageSize)
        return data
    }
    protected async Unique(name:string){
        const record = await (await this.movieRepository.createQueryBuilder())
        .andWhere('LOWER(movie.title) =:name',{name:name.trim().toLowerCase()}).getOne()
        if(record){
            return record
        }
    }
    protected async validateMovie(id:number){
        await this.movieRepository.isNotFound(id, `Tên này không tồn tại id = ${id}`)
    }
    protected async validateGenre(id:number){
        await this.genreRepository.isNotFound(id,`Thể loại Id = ${id} này không tồn tại`)
    }
    protected async validate(id: number, data: IMovieModel) {
        // Kiểm tra sự tồn tại của bản ghi
        if(id) await this.validateMovie(id)
        await Promise.all(data.genreId.map(async(id)=>await this.validateGenre(id)))
        // Kiểm tra tên có trùng hay không
        const record = await this.Unique(data.title);
        // Nếu record là null (tức là không có bản ghi nào), kiểm tra tên
        if (record && record.id!==id) {
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
            name:data.title.trim().toLowerCase()
        }))
        if(IsDuplicatesWithSort(arrayName)){
            throw new CustomError(`Tạo thể loại thất bại vì có model trùng tên`,400)
        }
        for(const data of datas){
            await this.create(data)
        }
      }
    async remove(id:number,transactionEntity?:EntityManager):Promise<void>{
        await this.validateMovie(id)
        await this.movieRepository.remove(id,transactionEntity)
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
    async waningDelete(ids:number[]){
            if(Array.isArray(ids)){
                await Promise.all(ids.map(async(id)=>await this.checkWaningDelete(id)))
            }
        }
        protected async checkWaningDelete(id:number){
            await this.validateGenre(id)
            const records =await (await this.movieRepository.createQueryBuilder())
            .innerJoin('movie.showtimes','showtime')
            .andWhere('showtime.movieId =:id',{id}).getOne()
            if(records){
                throw new CustomError(`Bạn xóa phim ${records.title} có thể mất nhiều dữ liệu quan trọng`,409)
            }
        }
}