import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Index,
} from "typeorm";
import { User } from "./User";
import { Ticket } from "./Ticket";
import { MethodPayment } from "../models/modelRequest/PaymentModel";
export enum StatusOrder {
  pending,
  complete,
  expired,
  fail,
}

@Entity()
@Index("bill_Index", ["orderCode", "user"])
export class Bill {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column()
  orderCode: string;
  @Column({ type: "int" })
  totalPrice!: number;
  @Column({ default: StatusOrder.pending })
  statusOrder: StatusOrder;
  @CreateDateColumn()
  bookingTime!: Date;
  @CreateDateColumn()
  reservation_time!: Date; // Thời gian yêu cầu đặt ghế
  @Column({ type: "datetime" })
  expiration_time!: Date; // Thời gian hết hạn (5 phút sau khi đặt)
  @Column({ type: "nvarchar" })
  paymentMethod: MethodPayment;
  @ManyToOne(() => User, (user) => user.bills, {
    onDelete: "CASCADE",
  })
  user!: User;
  @OneToMany(() => Ticket, (ticket) => ticket.bill)
  tickets!: Ticket[];
}
