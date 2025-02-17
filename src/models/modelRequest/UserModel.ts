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
  @IsString({ message: "Tên phải là một chuổi văn bản" })
  @IsNotEmpty({ message: "Tên không được trống" })
  @MaxLength(50, { message: "Tên người dùng tối đa 50 kí tự" })
  username: string;
  @IsString({ message: "Mật khẩu phải là một chuổi văn bản" })
  @IsNotEmpty({ message: "Mật khẩu không được trống" })
  @MaxLength(50, { message: "Mật khẩu dùng tối đa 50 kí tự" })
  @MinLength(8, { message: "Mật khẩu có ít nhất 8 kí tự" })
  password: string;
}
export class RegisterModel {
  @IsString({ message: "Email phải là một chuổi văn bản" })
  @IsNotEmpty({ message: "Email không được trống" })
  @IsEmail()
  email: string;
  @IsString({ message: "Mật khẩu phải là một chuổi văn bản" })
  @IsNotEmpty({ message: "Mật khẩu không được trống" })
  @MinLength(8, { message: "Mật khẩu ít có có 8 kí tự" })
  password: string;
  @IsString({ message: "Số điện thoại phải là một chuổi văn bản" })
  @IsNotEmpty({ message: "Số điện thoại không được trống" })
  phone: string;
  @IsString({ message: "Tên người dùng phải là một chuổi văn bản" })
  @IsNotEmpty({ message: "Tên người dùng không được trống" })
  username: string;
}
export class UserModel {
  @IsEmail()
  @IsNotEmpty({ message: "Email không được trống" })
  email: string;
  @IsNotEmpty({ message: "Số điện thoại không được trống" })
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
