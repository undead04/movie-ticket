import { IsDate, IsIn, IsInt, IsNotEmpty, IsString } from "class-validator";
import { IsUnique } from "../validations/UniqueValidator";
import { Movie } from "../Data/Movie";
import { Exists } from "../validations/ExitsValidator";
import { Genre } from "../Data/Genre";

export interface IMovieModel{
   title: string;
   description: string;
   duration: number; // Thời lượng phim (phút)
   releaseDate: Date;
   endDate: Date;
   trailerUrl:string,
   posterUrl:string,
   genreId:number[]
}
export class MovieModel{
   @IsString({message:"Tên phim phải là một chuổi văn bản"})
   @IsNotEmpty({message:"Tên phim không được trống"})
   @IsUnique(Movie,"title",'id',{message:'Tên phim không được trùng lặp'})
   
   title!:string;

   @IsString({message:"Mô tả phải là một chuổi văn bản"})
   @IsNotEmpty({message:"Mô tả không được trống"})
   description:string;

   @IsInt({message:"Thời lượng phải là số nguyên"})
   duration: number; // Thời lượng phim (phút)

   
   releaseDate: Date;

   
   endDate: Date;

   @IsString({message:"trailerUrl phải là một chuổi văn bản"})
   @IsNotEmpty({message:"trailerUrl không được trống"})
   trailerUrl:string;

   @IsString({message:"PosterUrl phải là một chuổi văn bản"})
   @IsNotEmpty({message:"PosterUrl không được trống"})
   posterUrl:string;

   @IsNotEmpty({message:"Không đc trống"})
   @Exists(Genre,"id",{message:"Không tìm thấy thể loại phim này"})
   genreId:number[];

   @IsInt()
   id?:number
   // Constructor
   constructor(id:number,data:IMovieModel) {
       this.title = data.title;
       this.description = data.description;
       this.duration=data.duration,
       this.endDate=data.endDate,
       this.trailerUrl=data.trailerUrl,
       this.releaseDate=data.releaseDate,
       this.posterUrl=data.posterUrl,
       this.genreId=data.genreId,
       this.id=id
   }

}