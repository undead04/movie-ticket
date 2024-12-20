import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Check } from 'typeorm';
import { Screen } from './Screen';
import { Ticket } from './Ticket';

@Entity()
@Check(`"row" >= 0 AND "col" >= 0 AND "row" <= 10 AND "col" <= 10`)
export class Seat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({type:"text"})
  seatNumber!: string;
  @Column({type:"int"})
  row!: number; // Vị trí hàng của ghế

  @Column()
  col!: number; // Vị trí cột của ghế

  @ManyToOne(() => Screen, (screen) => screen.seats, { onDelete: 'CASCADE' })
  screen!: Screen;

  @OneToMany(() => Ticket, (ticket) => ticket.seat)
  tickets!: Ticket[];

}
