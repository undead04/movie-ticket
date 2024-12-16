import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Showtime } from './Showtime';
import { Review } from './Review';
import { MovieGenre } from './MovieGenre';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column()
  duration!: number; // Thời lượng phim (phút)

  @Column({ nullable: true })
  trailerUrl!: string;

  @Column({ nullable: true })
  posterUrl!: string;

  @Column({ type: 'date', nullable: true })
  releaseDate!: Date;

  @Column({ type: 'date', nullable: true })
  endDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Showtime, (showtime) => showtime.movie)
  showtimes!: Showtime[];

  @OneToMany(() => Review, (review) => review.movie)
  reviews!: Review[];
  @OneToMany(()=>MovieGenre,(movieGenre)=>movieGenre.movie,)
  movieGenre!:MovieGenre[];
  
}
