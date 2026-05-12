import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { JournalEntry } from './journal_entry.entity';

@Entity('cib_journal_lines')
export class JournalLine {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() accountCode: string;
  @Column() accountNom: string;
  @Column() libelle: string;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) debit: number;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) credit: number;
  @Column({ nullable: true }) tiers: string;     // client/fournisseur
  @Column({ nullable: true }) lettrage: string;  // code lettrage
  @Column({ nullable: true }) jobId: string;
  @ManyToOne(() => JournalEntry, e => e.lines)
  @JoinColumn({ name: 'entryId' })
  entry: JournalEntry;
  @Column({ nullable: true }) entryId: string;
}
