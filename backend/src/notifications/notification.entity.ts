import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true })
  userId: number;
  @Column()
  title: string;
  @Column()
  message: string;
  @Column({ default: 'info' })
  type: string;
  @Column({ default: false })
  read: boolean;
  @CreateDateColumn()
  createdAt: Date;
}
