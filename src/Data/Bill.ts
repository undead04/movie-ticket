import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, OneToOne } from 'typeorm';
import { User } from './User';
import { Ticket } from './Ticket';
import { StatusOrder } from '../Model/BillModel';

@Entity()
export class Bill {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column()
  orderCode:string
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: number;
  @Column({default:StatusOrder.pending})
  statusOrder:StatusOrder
  @CreateDateColumn()
  bookingTime!: Date;
  @CreateDateColumn()
  reservation_time!: Date; // Thời gian yêu cầu đặt ghế
  @Column({ type: 'datetime' })
  expiration_time!: Date; // Thời gian hết hạn (5 phút sau khi đặt)
  @Column()
  paymentMethod:string
  @ManyToOne(() => User, (user) => user.bills, { onDelete: 'CASCADE' })
  user!: User;

  @OneToMany(()=>Ticket,(ticket)=>ticket.bill)
  tickets!:Ticket[]
}
