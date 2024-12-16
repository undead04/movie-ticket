import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { IsUnique } from "../validations/UniqueValidator";
import { User } from "../Data/User";

export interface IUserModel {

    username: string;
    password: string;
    email: string;
}
export interface IUserUpdateModel{
    username:string,
    phone:string
}
export interface IPasswordModel{
    oldPassword:string,
    newPassword:string,
    comfirmPassword:string
}
export class UserModel{
    @IsString()
    @IsNotEmpty()
    @IsUnique(User,"username",'id')
    username:string;
    @IsString()
    @IsNotEmpty()
    @MaxLength(8)
    password:string;
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email:string;
    
    constructor(data:IUserModel){
        this.username=data.username;
        this.password=data.password;
        this.email=data.email;
    }
}