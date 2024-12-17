import { IsInt, IsNotEmpty, IsString } from "class-validator";
import { IsUnique } from "../validations/UniqueValidator";
import { Theater } from "../Data/Theater";

export interface ITheaterModel{
    
    name:string,
    address:string,
    city:string,
}

export class TheaterModel{
    
    @IsString({message:"Tên rap chiếu phim phải là một chuổi văn bản"})
    @IsNotEmpty({message:"Tên rap chiếu phim không được trống"})
    @IsUnique(Theater,"name",'id',null,{message:'Tên rap chiếu phim không được trùng lặp'})
    name!:string;

    @IsString({message:"Địa chỉ phải là một chuổi văn bản"})
    @IsNotEmpty({message:"Địa chỉ không được trống"})
    address:string;

    @IsString({message:"Thành phố phải là một chuổi văn bản"})
    @IsNotEmpty({message:"Thành phố không được trống"})
    city:string;

    @IsInt()
    id?:number
    // Constructor
    constructor(id:number,data:ITheaterModel) {
        this.name = data.name;
        this.address = data.address;
        this.city=data.city
        this.id=id
    }

    
}