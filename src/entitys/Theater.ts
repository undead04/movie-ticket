import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { Screen } from "./Screen";

@Entity()
@Index("theater_fulltext", ["name", "address", "city"], { fulltext: true })
export class Theater {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "nvarchar", unique: true, length: 50 })
  name!: string;

  @Column({ type: "nvarchar", length: 50, unique: true })
  address!: string;

  @Column({ type: "nvarchar" })
  city!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Screen, (screen) => screen.theater)
  screens!: Screen[];
}
