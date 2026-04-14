import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  TECHNICIAN = 'technician',
  FINANCE = 'finance',
  HR = 'hr',
  VIEWER = 'viewer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  email: string;
  @Column()
  password: string;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.VIEWER })
  role: UserRole;
  @Column({ nullable: true })
  phone: string;
  @Column({ nullable: true })
  avatar: string;
  @Column({ default: true })
  isActive: boolean;
  @Column({ nullable: true, type: 'float' })
  latitude: number;
  @Column({ nullable: true, type: 'float' })
  longitude: number;
  @Column({ nullable: true })
  lastSeen: Date;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
