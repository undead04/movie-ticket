import { IsInt, IsNotEmpty, IsString, MIN } from "class-validator";
import { Exists } from "../validations/ExitsValidator";
import { Movie } from "../Data/Movie";
import { MaxValue } from "../validations/MaxValueValidator";

export interface IReviewModel{
    rating:number,
    comment:string,
    movieId:number
}
export class ReviewModel{
    @IsInt({message:"Số sao phải là số"})
    @MaxValue(1,5)
    rating:number;
    @IsString({message:"Bình luận phải là kiểu chuổi"})
    @IsNotEmpty({message:"Bình luận này không được rổng"})
    comment:string;
    @IsInt({message:"Phải là số"})
    @Exists(Movie,"id",{'message':"Không tìm thấy movie này"})
    movieId:number
    constructor(data:IReviewModel){
        this.rating=data.rating;
        this.comment=data.comment;
        this.movieId=data.movieId
    }
}