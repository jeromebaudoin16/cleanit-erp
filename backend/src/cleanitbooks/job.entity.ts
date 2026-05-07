import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cib_jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() name: string;
  @Column({ nullable: true }) customerId: string;
  @Column({ nullable: true }) bcRef: string;
  @Column({ nullable: true }) jobType: string;
  @Column({ default: 'Pending' }) statut: string;
  @Column({ nullable: true }) site: string;
  @Column({ nullable: true }) chefProjet: string;
  @Column({ nullable: true }) startDate: string;
  @Column({ nullable: true }) endDate: string;
  @Column({ default: 'FCFA' }) currency: string;
  @Column({ nullable: true, type: 'text' }) description: string;
  @Column({ nullable: true, type: 'text' }) notes: string;
  @Column({ type: 'bigint', default: 0 }) budgetHuawei: number;
  @Column({ type: 'bigint', default: 0 }) contractAmount: number;
  @Column({ type: 'jsonb', nullable: true }) budgetEstime: object;
  @Column({ type: 'jsonb', nullable: true }) coutsReels: object;
  @Column({ type: 'jsonb', nullable: true }) phases: object[];
  @Column({ type: 'jsonb', nullable: true }) lignesBC: object[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
