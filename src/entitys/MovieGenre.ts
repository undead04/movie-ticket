import { Entity, PrimaryGeneratedColumn, ManyToOne, Index } from "typeorm";
import { Genre } from "./Genre";
import { Movie } from "./Movie";

@Entity()
@Index("movieGenre_index", ["genre", "movie"])
export class MovieGenre {
  @PrimaryGeneratedColumn()
  id!: number;
  @ManyToOne(() => Genre, (genre) => genre.movieGenre, { onDelete: "CASCADE" })
  genre!: Genre;
  @ManyToOne(() => Movie, (movie) => movie.movieGenre, { onDelete: "CASCADE" })
  movie!: Movie;
}
