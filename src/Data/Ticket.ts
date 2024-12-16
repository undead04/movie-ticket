import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Showtime } from './Showtime';
import { Seat } from './Seat';
import { Bill } from './Bill';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id!: number;
 
  
  @ManyToOne(() => Showtime, (showtime) => showtime.tickets, { onDelete: 'CASCADE' })
  showtime!: Showtime;

  @ManyToOne(() => Seat, (seat) => seat.tickets, { onDelete: 'CASCADE' })
  seat!: Seat;

  @ManyToOne(()=>Bill,(bill)=>bill.tickets,{onDelete:"CASCADE"})
  bill!:Bill

}
