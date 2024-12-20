import { IsInt, IsNotEmpty, IsPositive, IsString, Max, MaxLength } from "class-validator";
import { Unique } from "typeorm";

export interface IScreenModel{
    seatCapacity:number,
    name:string,
    theaterId:number
}
export class ScreenModel{
    
    @IsString({message:"Tên phòng chiếu rạp phải là một chuổi văn bản"})
    @IsNotEmpty({message:"Tên phòng chiếu rạp không được trống"})
    @MaxLength(50,{message:"Tên phòng chiếu phim tối da 50 kí tự"})
    name!:string;

    @IsInt({message:"Số tổng ghế phải là một chuổi văn bản"})
    @IsNotEmpty({message:"Số tổng ghế không được trống"})
    @IsPositive({message:"Số lượng tối đa của ghế trong phòng phải là số dương"})
    @Max(100,{message:"Tối đa một phòng chỉ có 100 ghế"})
    seatCapacity:number;

    @IsInt({message:"Rạp chiếu phim phải là một chuổi văn bản"})
    @IsNotEmpty({message:"Rạp chiếu phim không được trống"})
    theaterId:number
}