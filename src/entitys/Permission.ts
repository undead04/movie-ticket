import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { GroupRolePermission } from './GroupRolePermission';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @OneToMany(() => GroupRolePermission, (groupRolePermission) => groupRolePermission.permission)
  groupRolePermissions!: GroupRolePermission[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;
}
