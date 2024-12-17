import {  IsInt, IsNotEmpty, IsString } from "class-validator";
import { Exists } from "../validations/ExitsValidator";
import { Screen } from "../Data/Screen";
import { IsUnique } from "../validations/UniqueValidator";
import { Seat } from "../Data/Seat";
import { MaxValue } from "../validations/MaxValueValidator";

export interface ISeatModel{
    row:number,
    col:number,
    seatNumber:string
    screenId:number
}

export class SeatModel{
    
    @IsNotEmpty({message:"Vị trí hàng ngang không được trống"})
    @IsInt({message:"Vị trí hàng ngang phải là số phải là số"})
    @MaxValue(0,10)
    row:number;

    @IsNotEmpty({message:"Vị trí cột không được trống"})
    @IsInt({message:"vị trí cột phải là số"})
    @MaxValue(0,10)
    col:number;

    @IsNotEmpty({message:"seatNumber không được trống"})
    @IsString({message:"seatNumber phải là string"})
    @IsUnique(Seat,'seatNumber','id',{column:"screen",field:"screenId"},{message:"Tên ghế này trong phòng đã có"})
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