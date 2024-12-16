import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Theater } from './Theater';
import { Seat } from './Seat';
import { Showtime } from './Showtime';

@Entity()
export class Screen {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  seatCapacity!: number;

  @ManyToOne(() => Theater, (theater) => theater.screens, { onDelete: 'CASCADE' })
  theater!: Theater;

  @OneToMany(() => Seat, (seat) => seat.screen)
  seats!: Seat[];

  @OneToMany(() => Showtime, (showtime) => showtime.screen)
  showtimes!: Showtime[];
}
