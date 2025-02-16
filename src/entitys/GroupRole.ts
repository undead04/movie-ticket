import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './User';
import { GroupRolePermission } from './GroupRolePermission';

@Entity()
export class GroupRole {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @OneToMany(() => User, (user) => user.groupRole)
  users!: User[];

  @OneToMany(() => GroupRolePermission, (groupRolePermission) => groupRolePermission.groupRole)
  groupRolePermissions!: GroupRolePermission[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;
}
