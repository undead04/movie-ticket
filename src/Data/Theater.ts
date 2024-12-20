import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Screen } from './Screen';

@Entity()
export class Theater {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({type:"text", unique:true,length:50})
  name!: string;

  @Column({ type: 'text',length:50,unique:true })
  address!: string;

  @Column({type:"text"})
  city!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Screen, (screen) => screen.theater)
  screens!: Screen[];
}
