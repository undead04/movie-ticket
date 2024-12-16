import { IsInt, IsNotEmpty, IsString, MIN } from "class-validator";
import { Exists } from "../validations/ExitsValidator";
import { Movie } from "../Data/Movie";

export interface IReviewModel{
    rating:number,
    comment:string,
    movieId:number
}
export class ReviewModel{
    @IsInt()
    rating:number;
    @IsString()
    @IsNotEmpty()
    comment:string;
    @IsInt()
    @Exists(Movie,"id")
    movieId:number
    constructor(data:IReviewModel){
        this.rating=data.rating;
        this.comment=data.comment;
        this.movieId=data.movieId
    }
}