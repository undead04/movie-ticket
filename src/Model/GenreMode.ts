import { IsEmpty, IsInt, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { IsUnique } from "../validations/UniqueValidator";
import { Genre } from "../Data/Genre";
export class IGenreModel{
 name:string;
 description:string;
}
export class GenreModel{
    
    @IsString({message:"Tên thể loại phải là một chuổi văn bản"})
    @IsNotEmpty({message:"Tên thể loại không được trống"})
    @IsUnique(Genre,"name",'id',null,{message:'Tên thể loại không được trùng lặp'})
    name!:string;
    @IsString({message:"Mô tả phải là một chuổi văn bản"})
    @IsNotEmpty({message:"Mô tả không được trống"})
    description:string;

    @IsInt()
    id?:number
    // Constructor
    constructor(id:number,data:IGenreModel) {
        this.name = data.name;
        this.description = data.description;
        this.id=id
    }

    
}