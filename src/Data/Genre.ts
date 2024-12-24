import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique, BeforeInsert, BeforeUpdate, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MovieGenre } from './MovieGenre';

@Entity()
export class Genre {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: 'nvarchar', length: 50, unique: true })
  name!: string;
  @Column({ type: 'text', nullable: true })
  description!: string;
  
  @CreateDateColumn()
  created_at!: Date;
  @UpdateDateColumn()
  update_at!:Date
  @OneToMany(()=>MovieGenre,(movieGenre)=>movieGenre.genre)
  movieGenre!:MovieGenre[]
}
