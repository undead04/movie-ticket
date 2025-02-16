import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { MovieGenre } from "./MovieGenre";

@Entity()
@Index("genre_full", ["name", "description"], { fulltext: true })
export class Genre {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: "nvarchar", length: 50, unique: true })
  name!: string;
  @Column({ type: "text", nullable: true })
  description!: string;

  @CreateDateColumn()
  created_at!: Date;
  @UpdateDateColumn()
  update_at!: Date;
  @OneToMany(() => MovieGenre, (movieGenre) => movieGenre.genre)
  movieGenre!: MovieGenre[];
}
