import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('cib_time_entries')
export class TimeEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true }) empId: string;
  @Column({ nullable: true }) empName: string;
  @Column({ nullable: true }) date: string;
  @Column({ nullable: true }) jobId: string;
  @Column({ nullable: true }) jobName: string;
  @Column({ nullable: true }) service: string;
  @Column({ type: 'float', default: 0 }) hours: number;
  @Column({ type: 'bigint', default: 0 }) rate: number;
  @Column({ default: true }) billable: boolean;
  @Column({ nullable: true, type: 'text' }) note: string;

  @CreateDateColumn() createdAt: Date;
}
