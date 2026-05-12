import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('cib_fiscal_years')
export class FiscalYear {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() nom: string;           // Ex: "Exercice 2024"
  @Column() dateDebut: string;     // YYYY-MM-DD
  @Column() dateFin: string;
  @Column({ default: 'open' }) statut: string; // open|closed
  @Column({ default: false }) cloture: boolean;
  @CreateDateColumn() createdAt: Date;
}
