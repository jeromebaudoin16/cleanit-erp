import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cib_vendors')
export class Vendor {
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
  @Column({ nullable: true }) country: string;
  @Column({ default: 'Equipementier' }) type: string;
  @Column({ default: 'Net 30' }) terms: string;
  @Column({ default: 'FCFA' }) currency: string;
  @Column({ nullable: true }) taxId: string;
  @Column({ nullable: true }) accountNum: string;
  @Column({ type: 'bigint', default: 0 }) balance: number;
  @Column({ type: 'bigint', default: 0 }) creditLimit: number;
  @Column({ default: 'Active' }) status: string;
  @Column({ nullable: true }) notes: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
