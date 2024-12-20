import { IsInt, IsNotEmpty, IsString, Max, Min, MIN } from "class-validator";

import { Movie } from "../Data/Movie";

export interface IReviewModel{
    rating:number,
    comment:string,
    movieId:number,
    userId:number,
}
export class ReviewModel{
    @IsInt({message:"Số sao phải là số"})
    @IsNotEmpty({message:"Không đc trống"})
    @Min(1,{message:"Số sao nhỏ nhất là 1"})
    @Max(5,{message:"Số sao lớn nhất là 5"})
    rating:number;
    @IsString({message:"Bình luận phải là kiểu chuổi"})
    @IsNotEmpty({message:"Bình luận này không được rổng"})
    comment:string;
    @IsInt({message:"Phải là số"})
    @IsNotEmpty({message:"movieId không đc để trống"})
    movieId:number
}