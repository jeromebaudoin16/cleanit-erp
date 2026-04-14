import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true })
  poNumber: string;
  @Column({ nullable: true })
  supplier: string;
  @Column({ nullable: true, type: 'float' })
  totalAmount: number;
  @Column({ nullable: true })
  currency: string;
  @Column({ nullable: true, type: 'jsonb' })
  items: any[];
  @Column({ nullable: true, type: 'jsonb' })
  actions: any[];
  @Column({ default: 'pending' })
  status: string;
  @CreateDateColumn()
  createdAt: Date;
}
