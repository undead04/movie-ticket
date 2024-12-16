import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Screen } from './Screen';
import { Ticket } from './Ticket';

@Entity()
export class Seat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  seatNumber!: string;
  @Column()
  row!: number; // Vị trí hàng của ghế

  @Column()
  col!: number; // Vị trí cột của ghế

  @ManyToOne(() => Screen, (screen) => screen.seats, { onDelete: 'CASCADE' })
  screen!: Screen;

  @OneToMany(() => Ticket, (ticket) => ticket.seat)
  tickets!: Ticket[];

}
