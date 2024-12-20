import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique, BeforeInsert, BeforeUpdate } from 'typeorm';
import { MovieGenre } from './MovieGenre';

@Entity()
export class Genre {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @OneToMany(()=>MovieGenre,(movieGenre)=>movieGenre.genre)
  movieGenre!:MovieGenre[]
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;
  @BeforeInsert()
  async validateInsert(){
    this.name.trim()
    this.description.trim()
  }
  @BeforeUpdate()
  async beforeUpdate(){
    this.name.trim()
    this.description.trim()
    this.created_at=new Date()
  }
}
