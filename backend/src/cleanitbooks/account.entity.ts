import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cib_accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) code: string;
  @Column() nom: string;
  @Column() classe: string; // 1-9
  @Column() type: string;   // actif|passif|charge|produit|tresorerie
  @Column({ default: 'normal' }) nature: string; // normal|contrepartie
  @Column({ default: true }) actif: boolean;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) soldeDebit: number;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) soldeCredit: number;
  @Column({ nullable: true }) description: string;
  @Column({ nullable: true }) parentCode: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
