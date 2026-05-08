import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('pointages')
export class Pointage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() userId: string;
  @Column() userName: string;
  @Column() userType: string;
  @Column() typeEmploye: string; // 'interne' | 'externe'
  @Column() typePointage: string; // 'entree' | 'sortie' | 'pause_debut' | 'pause_fin'
  @Column({ type: 'float', nullable: true }) lat: number;
  @Column({ type: 'float', nullable: true }) lng: number;
  @Column({ nullable: true }) zoneCode: string;
  @Column({ nullable: true }) jobId: string;
  @Column({ default: false }) horsZone: boolean;
  @Column({ type: 'float', default: 0 }) distanceZone: number;
  @Column({ nullable: true }) selfieUrl: string;
  @Column({ nullable: true }) selfieVerified: boolean;
  @Column({ nullable: true }) deviceId: string;
  @Column({ nullable: true }) notes: string;
  @Column({ default: 'pending' }) statut: string; // pending | validated | rejected
  @Column({ nullable: true }) validatedBy: string;
  @Column({ nullable: true }) validatedAt: Date;
  @Column({ type: 'bigint' }) timestamp: number;

  @CreateDateColumn() createdAt: Date;
}
