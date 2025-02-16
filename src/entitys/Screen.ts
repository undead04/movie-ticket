import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
} from "typeorm";
import { Theater } from "./Theater";
import { Seat } from "./Seat";
import { Showtime } from "./Showtime";

@Entity()
@Index("screen_index", ["theater"])
export class Screen {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "int", unsigned: true })
  seatCapacity!: number;

  @ManyToOne(() => Theater, (theater) => theater.screens, {
    onDelete: "CASCADE",
  })
  theater!: Theater;

  @OneToMany(() => Seat, (seat) => seat.screen)
  seats!: Seat[];

  @OneToMany(() => Showtime, (showtime) => showtime.screen)
  showtimes!: Showtime[];
}
