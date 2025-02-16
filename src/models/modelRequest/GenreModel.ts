import {IsNotEmpty, IsString } from "class-validator"
export class IGenreModel{
 name:string;
 description:string;
}
export class GenreModel{
    
    @IsString({message:"Tên thể loại phải là một chuổi văn bản"})
    @IsNotEmpty({message:"Tên thể loại không được trống"})
    name!:string;
    @IsString({message:"Mô tả phải là một chuổi văn bản"})
    @IsNotEmpty({message:"Mô tả không được trống"})
    description:string;

    
}