import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Movie } from './Movie';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', width: 1 })
  rating!: number; // Giới hạn từ 1 đến 5

  @Column({ type: 'text', nullable: true })
  comment!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Movie, (movie) => movie.reviews, { onDelete: 'CASCADE' })
  movie!: Movie;
}
