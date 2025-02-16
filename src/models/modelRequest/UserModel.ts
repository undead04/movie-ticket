import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class LoginModel {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(8)
  password: string;
}
export class RegisterModel {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
  @IsString()
  @IsNotEmpty()
  phone: string;
  @IsString()
  @IsNotEmpty()
  username: string;
}
export class UserModel {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  phone: string;
}
export class PasswordModel {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  oldPassword: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;
}
