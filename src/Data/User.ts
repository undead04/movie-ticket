import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { GroupRole } from './GroupRole';
import { Review } from './Review';
import { Bill } from './Bill';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'nvarchar', length: 50, unique: true })
  username!: string;

  @Column({ type: 'nvarchar', length: 255 })
  password_hash!: string;

  @Column({ type: 'nvarchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'nvarchar', length: 15, nullable: true })
  phone!: string;

  @ManyToOne(() => GroupRole, (groupRole) => groupRole.users, { nullable: true })
  groupRole!: GroupRole;
  @OneToMany(()=>Bill,(bill)=>bill.user,{onDelete:"CASCADE"})
  bills!:Bill[]
  @OneToMany(()=>Review,(review)=>review.user)
  reviews!:Review[]
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;
}
