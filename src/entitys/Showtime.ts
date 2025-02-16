import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
} from "typeorm";
import { Movie } from "./Movie";
import { Screen } from "./Screen";
import { Ticket } from "./Ticket";

@Entity()
@Index("showtime_index", ["movie", "screen"])
export class Showtime {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "date" })
  showDate!: Date;

  @Column({ type: "time" })
  startTime!: string;

  @Column({ type: "time" })
  endTime!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @ManyToOne(() => Movie, (movie) => movie.showtimes, { onDelete: "CASCADE" })
  movie!: Movie;

  @ManyToOne(() => Screen, (screen) => screen.showtimes, {
    onDelete: "CASCADE",
  })
  screen!: Screen;

  @OneToMany(() => Ticket, (ticket) => ticket.showtime)
  tickets!: Ticket[];
}
