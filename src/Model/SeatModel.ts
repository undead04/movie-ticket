import {  IsInt, IsNotEmpty, IsString } from "class-validator";
import { Exists } from "../validations/ExitsValidator";
import { Screen } from "../Data/Screen";

export interface ISeatModel{
    row:number,
    col:number,
    seatNumber:string
    screenId:number
}

export class SeatModel{
    
    @IsNotEmpty({message:"Row không được trống"})
    @IsInt({message:"Row phải là số"})
    row:number;

    @IsNotEmpty({message:"col không được trống"})
    @IsInt({message:"col phải là số"})
    
    col:number;

    @IsNotEmpty({message:"seatNumber không được trống"})
    @IsString({message:"seatNumber phải là string"})
    seatNumber:string

    @IsInt({message:"Phải là số"})
    @IsNotEmpty({message:"Không được trống"})
    @Exists(Screen,"id",{message:"Không tìm thấy phòng này"})
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