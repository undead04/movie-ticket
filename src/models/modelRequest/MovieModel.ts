import {
  IsDate,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Max,
  MaxLength,
} from "class-validator";

export class MovieModel {
  @IsString({ message: "Tên phim phải là một chuổi văn bản" })
  @IsNotEmpty({ message: "Tên phim không được trống" })
  @MaxLength(50, { message: "Tên phim tối đa 50 kí tự" })
  title!: string;

  @IsString({ message: "Mô tả phải là một chuổi văn bản" })
  @IsNotEmpty({ message: "Mô tả không được trống" })
  @MaxLength(300, { message: "Mô tả phim tối đa 300 kí tự" })
  description: string;

  @IsInt({ message: "Thời lượng phải là số nguyên" })
  @IsPositive({ message: "Thời lượng phim phải là số dương" })
  @Max(200, { message: "Thời lượng phim tốt đa 200 phút" })
  duration: number; // Thời lượng phim (phút)

  releaseDate: Date;

  endDate: Date;

  @IsString({ message: "trailerUrl phải là một chuổi văn bản" })
  @IsNotEmpty({ message: "trailerUrl không được trống" })
  trailerUrl: string;

  @IsString({ message: "PosterUrl phải là một chuổi văn bản" })
  @IsNotEmpty({ message: "PosterUrl không được trống" })
  posterUrl: string;

  @IsNotEmpty({ message: "Không đc trống" })
  genreId: number[];
}
