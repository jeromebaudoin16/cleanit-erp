import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';

export enum TypePointage {
  ENTREE = 'entree',
  SORTIE = 'sortie',
  PAUSE_DEBUT = 'pause_debut',
  PAUSE_FIN = 'pause_fin',
}

export enum TypeEmploye {
  INTERNE = 'interne',
  EXTERNE = 'externe',
}

@Entity('pointages')
export class Pointage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  userName: string;

  @Column()
  userRole: string;

  @Column({ type: 'enum', enum: TypePointage })
  type: TypePointage;

  @Column({ type: 'enum', enum: TypeEmploye, default: TypeEmploye.INTERNE })
  typeEmploye: TypeEmploye;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  adresse: string;

  @Column({ nullable: true })
  siteCode: string;

  @Column({ nullable: true })
  siteName: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ default: false })
  horsZone: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distanceZone: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  deviceInfo: string;

  @Column({ default: true })
  valide: boolean;

  @Column({ nullable: true })
  validePar: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  heurePointage: Date;
}
