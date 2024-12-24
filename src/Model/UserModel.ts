import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class UserUpdateModel{
    @IsNotEmpty()
    @IsString()
    username:string
    @IsNotEmpty()
    @IsString()
    phone:string
}
export class LoginModel{
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    email:string;
    @MinLength(8)
    @MaxLength(30)
    password:string
}
export class PasswordModel{
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    oldPassword:string
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    newPassword:string
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    confirmPassword:string
}
export class UserModel{
    @IsString()
    @IsNotEmpty()
    username:string;
    @IsString()
    @IsNotEmpty()
    @MaxLength(8)
    password:string;
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email:string;

}