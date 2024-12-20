import { IsInt, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Theater } from "../Data/Theater";

export interface ITheaterModel{
    
    name:string,
    address:string,
    city:string,
}

export class TheaterModel{
    
    @IsString({message:"Tên rap chiếu phim phải là một chuổi văn bản"})
    @IsNotEmpty({message:"Tên rap chiếu phim không được trống"})
    @MaxLength(50,{message:"Tên rạp chiếu phim tối đa là 50 kí tự"})
    name!:string;
    @IsString({message:"Địa chỉ phải là một chuổi văn bản"})
    @IsNotEmpty({message:"Địa chỉ không được trống"})
    address:string;

    @IsString({message:"Thành phố phải là một chuổi văn bản"})
    @IsNotEmpty({message:"Thành phố không được trống"})
    city:string;
}