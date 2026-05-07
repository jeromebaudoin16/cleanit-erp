import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cib_bills')
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true }) vendorId: string;
  @Column({ nullable: true }) date: string;
  @Column({ nullable: true }) dueDate: string;
  @Column({ nullable: true }) refNum: string;
  @Column({ nullable: true, type: 'text' }) memo: string;
  @Column({ default: 'FCFA' }) currency: string;
  @Column({ nullable: true }) jobId: string;
  @Column({ type: 'jsonb', nullable: true }) lines: object[];
  @Column({ type: 'bigint', default: 0 }) total: number;
  @Column({ type: 'bigint', default: 0 }) amountPaid: number;
  @Column({ type: 'bigint', default: 0 }) balance: number;
  @Column({ default: 'Unpaid' }) status: string;
  @Column({ type: 'jsonb', nullable: true }) payments: object[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
