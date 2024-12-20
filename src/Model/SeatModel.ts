import {  IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";
import { Screen } from "../Data/Screen";
import { Seat } from "../Data/Seat";

export interface ISeatModel{
    row:number,
    col:number,
    seatNumber:string
    screenId:number
}

export class SeatModel{
    
    @IsNotEmpty({message:"Vị trí hàng ngang không được trống"})
    @IsInt({message:"Vị trí hàng ngang phải là số phải là số"})
    @Min(0,{message:"Vị trí ghế hàng ngang phải nhỏ nhất là 0"})
    @Max(10,{message:"Vị trí ghê hàng ngang lớn nhất là 10"})
    row:number;

    @IsNotEmpty({message:"Vị trí cột không được trống"})
    @IsInt({message:"vị trí cột phải là số"})
    @Min(0,{message:"Vị trí ghế hàng dọc phải nhỏ nhất là 0"})
    @Max(10,{message:"Vị trí ghê hàng dọc lớn nhất là 10"})
    col:number;

    @IsNotEmpty({message:"seatNumber không được trống"})
    @IsString({message:"seatNumber phải là string"})
    seatNumber:string

    @IsInt({message:"Phải là số"})
    @IsNotEmpty({message:"Không được trống"})
    screenId:number
    @IsInt()
    id?:number
    // Constructor
    constructor(id:number,data:ISeatModel) {
        this.row = data.row;
        this.col=data.col;
        this.screenId=data.screenId
        this.seatNumber=data.seatNumber
        this.id=id
    }
}