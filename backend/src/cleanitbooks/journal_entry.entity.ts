import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { JournalLine } from './journal_line.entity';

@Entity('cib_journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() numero: string;        // Ex: JNL-2024-0001
  @Column() date: string;
  @Column() journal: string;       // VENTES|ACHATS|BANQUE|CAISSE|OD
  @Column() libelle: string;
  @Column({ nullable: true }) pieceRef: string;   // INV-xxx, BILL-xxx
  @Column({ nullable: true }) pieceType: string;  // invoice|bill|payment
  @Column({ type: 'decimal', precision: 18, scale: 2 }) totalDebit: number;
  @Column({ type: 'decimal', precision: 18, scale: 2 }) totalCredit: number;
  @Column({ default: 'validated' }) statut: string;
  @Column({ nullable: true }) fiscalYearId: string;
  @Column({ nullable: true }) createdBy: string;
  @OneToMany(() => JournalLine, l => l.entry, { cascade: true, eager: true })
  lines: JournalLine[];
  @CreateDateColumn() createdAt: Date;
}
