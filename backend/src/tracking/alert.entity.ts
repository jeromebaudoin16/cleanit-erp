import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('alertes')
export class Alerte {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() type: string; // 'hors_zone' | 'retard' | 'absence' | 'batterie' | 'offline'
  @Column() userId: string;
  @Column() userName: string;
  @Column({ nullable: true }) zoneCode: string;
  @Column({ nullable: true }) jobId: string;
  @Column({ nullable: true, type: 'text' }) message: string;
  @Column({ default: 'high' }) severite: string; // low | medium | high | critical
  @Column({ default: 'open' }) statut: string; // open | acknowledged | resolved
  @Column({ nullable: true }) acknowledgedBy: string;
  @Column({ nullable: true }) resolvedAt: Date;
  @Column({ type: 'jsonb', nullable: true }) metadata: object;

  @CreateDateColumn() createdAt: Date;
}
