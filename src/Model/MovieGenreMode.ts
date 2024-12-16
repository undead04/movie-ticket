import { IsInt, isInt, IsNotEmpty } from "class-validator";
import { Exists } from "../validations/ExitsValidator";
import { Movie } from "../Data/Movie";

export interface IMovieGenreModel{
    movieId:number,
    genreId:number,
}
export class MovieGenreModel{
    @IsInt({message:"Phải là số"})
    @Exists(Movie,'id',{message:"Không tìm thấy phim này"})
    @IsNotEmpty({message:"Không được trống"})
    movieId:number
    @IsInt({message:"Phải là số"})
    @Exists(Movie,'id',{message:"Không tìm thấy phim này"})
    @IsNotEmpty({message:"Không được trống"})
    genreId:number
    @IsInt()
    id?:number
    constructor(id:number,data:IMovieGenreModel){
        this.id=id;
        this.genreId=data.genreId;
        this.movieId=data.movieId;
    }
}