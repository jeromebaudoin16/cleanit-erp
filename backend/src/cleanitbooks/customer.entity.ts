import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('cib_customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() company: string;
  @Column({ nullable: true }) contact: string;
  @Column({ nullable: true }) title: string;
  @Column({ nullable: true }) email: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) mobile: string;
  @Column({ nullable: true }) address: string;
  @Column({ nullable: true }) city: string;
  @Column({ nullable: true }) region: string;
  @Column({ default: 'Cameroun' }) country: string;
  @Column({ nullable: true }) website: string;
  @Column({ default: 'Telecom' }) type: string;
  @Column({ default: 'Net 30' }) terms: string;
  @Column({ default: 'FCFA' }) currency: string;
  @Column({ default: 'TVA' }) taxCode: string;
  @Column({ nullable: true }) taxId: string;
  @Column({ type: 'bigint', default: 0 }) creditLimit: number;
  @Column({ default: 'Standard' }) priceLevel: string;
  @Column({ nullable: true }) accountNum: string;
  @Column({ type: 'bigint', default: 0 }) balance: number;
  @Column({ default: 'Active' }) status: string;
  @Column({ nullable: true }) notes: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
