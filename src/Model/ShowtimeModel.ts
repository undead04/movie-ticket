import { IsDate, IsInt, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { Exists } from "../validations/ExitsValidator";
import { Movie } from "../Data/Movie";
import { Screen } from "../Data/Screen";

export interface IShowtimeModel{
    showDate:Date,
    endTime:string,
    startTime:string
    price:number
    movieId:number,
    screenId:number
}
export class ShowtimeModel{
    
    showDate:Date;
    @IsNotEmpty()
    @IsString()
    endTime:string;
    @IsNotEmpty()
    @IsString()
    startTime:string
    @IsNumber()
    price:number
    @Exists(Movie,"id")
    movieId:number
    @Exists(Screen,"id")
    screenId:number
    @IsInt()
    id?:number
    constructor(id:number,data:IShowtimeModel){
        this.endTime=data.endTime;
        this.id=id,
        this.movieId=data.movieId,
        this.price=data.price,
        this.screenId=data.screenId,
        this.showDate=data.showDate,
        this.startTime=data.startTime
    }
}