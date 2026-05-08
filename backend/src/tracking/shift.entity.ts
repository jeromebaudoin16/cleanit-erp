import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() jobId: string;
  @Column() jobName: string;
  @Column() technicienId: string;
  @Column() technicienName: string;
  @Column() chefProjetId: string;
  @Column() chefProjetName: string;
  @Column() zoneCode: string;
  @Column({ nullable: true }) zoneName: string;
  @Column() dateDebut: string;
  @Column() dateFin: string;
  @Column({ nullable: true }) heureDebut: string;
  @Column({ nullable: true }) heureFin: string;
  @Column({ nullable: true, type: 'text' }) description: string;
  @Column({ nullable: true, type: 'text' }) instructions: string;
  @Column({ default: 'assigned' }) statut: string; // assigned | in_progress | completed | validated | cancelled
  @Column({ nullable: true }) completedAt: Date;
  @Column({ nullable: true, type: 'text' }) rapportTechnicien: string;
  @Column({ nullable: true }) priority: string; // low | medium | high | urgent

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
