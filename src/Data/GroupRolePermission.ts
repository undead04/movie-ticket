import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GroupRole } from './GroupRole';
import { Permission } from './Permission';

@Entity()
export class GroupRolePermission {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => GroupRole, (groupRole) => groupRole.groupRolePermissions,{onDelete:"CASCADE"})
  groupRole!: GroupRole;

  @ManyToOne(() => Permission, (permission) => permission.groupRolePermissions,{onDelete:"CASCADE"})
  permission!: Permission;
}
