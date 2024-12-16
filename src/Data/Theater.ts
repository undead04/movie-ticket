import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Screen } from './Screen';

@Entity()
export class Theater {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column()
  city!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Screen, (screen) => screen.theater)
  screens!: Screen[];
}
