import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cib_invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true }) customerId: string;
  @Column({ nullable: true }) jobId: string;
  @Column({ nullable: true }) date: string;
  @Column({ nullable: true }) dueDate: string;
  @Column({ default: 'Net 30' }) terms: string;
  @Column({ nullable: true }) poNumber: string;
  @Column({ nullable: true, type: 'text' }) memo: string;
  @Column({ default: 'FCFA' }) currency: string;
  @Column({ type: 'jsonb', nullable: true }) lines: object[];
  @Column({ type: 'bigint', default: 0 }) subtotal: number;
  @Column({ type: 'float', default: 0.1925 }) taxRate: number;
  @Column({ type: 'bigint', default: 0 }) taxAmount: number;
  @Column({ type: 'bigint', default: 0 }) total: number;
  @Column({ type: 'bigint', default: 0 }) amountPaid: number;
  @Column({ type: 'bigint', default: 0 }) balance: number;
  @Column({ default: 'Draft' }) status: string;
  @Column({ type: 'jsonb', nullable: true }) payments: object[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
