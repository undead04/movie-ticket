import {
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from "class-validator";

export class ShowtimeModel {
  showDate: Date;
  @IsNotEmpty({ message: "End time không được trống" })
  @IsString({ message: "End time phải là kiểu chuổi" })
  endTime: string;
  @IsNotEmpty({ message: "Start time không được trống" })
  @IsString({ message: "Start time phải là kiểu chuổi" })
  startTime: string;
  @IsInt({ message: "Phải là kiểu số" })
  @IsNotEmpty({ message: "Price không được trống" })
  @IsPositive({ message: "Tiền phải là số dương" })
  price: number;
  @IsInt({ message: "Phải là kiểu số" })
  @IsNotEmpty({ message: "moveId không được trống" })
  movieId: number;
  @IsInt({ message: "Phải là kiểu số" })
  @IsNotEmpty({ message: "screenId không được trống" })
  screenId: number;
}
export interface IShowTimeDTO {
  showDate: Date;
  endTime: string;
  startTime: string;
  price: number;
  movie: { id: number };
  screen: { id: number };
}
