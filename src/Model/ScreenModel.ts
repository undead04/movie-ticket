import { IsIn, IsInt, IsNotEmpty, IsString } from "class-validator";
import { IsUnique } from "../validations/UniqueValidator";
import { Screen } from "../Data/Screen";
import { Exists } from "../validations/ExitsValidator";
import { Theater } from "../Data/Theater";

export interface IScreenModel{
    seatCapacity:number,
    name:string,
    theaterId:number
}
export class ScreenModel{
    
    @IsString({message:"Tên phòng chiếu rạp phải là một chuổi văn bản"})
    @IsNotEmpty({message:"Tên phòng chiếu rạp không được trống"})
    name!:string;

    @IsInt({message:"Số tổng ghế phải là một chuổi văn bản"})
    @IsNotEmpty({message:"Số tổng ghế không được trống"})
    seatCapacity:number;

    @IsInt({message:"Rạp chiếu phim phải là một chuổi văn bản"})
    @IsNotEmpty({message:"Rạp chiếu phim không được trống"})
    @Exists(Theater,"id",{message:"Rạp chiếu phim này không tồn tại"})
    theaterId:number
    @IsInt()
    id?:number
    // Constructor
    constructor(id:number,data:IScreenModel) {
        this.name = data.name;
        this.seatCapacity = data.seatCapacity;
        this.theaterId=data.theaterId;
        this.id=id
    }
}