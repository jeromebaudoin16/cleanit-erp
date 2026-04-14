import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  ville: string;

  @Column({ nullable: true })
  adresse: string;

  @Column({ nullable: true, type: 'float' })
  latitude: number;

  @Column({ nullable: true, type: 'float' })
  longitude: number;

  @Column({ default: 'planifie' })
  status: string;

  @Column({ nullable: true })
  typeTravauxEnum: string;

  @Column({ nullable: true })
  technology: string;

  @Column({ nullable: true })
  poNumber: string;

  @Column({ nullable: true })
  projectManager: string;

  @Column({ nullable: true })
  technicienAssigne: string;

  @Column({ nullable: true, type: 'float' })
  progression: number;

  @Column({ nullable: true })
  dateDebut: Date;

  @Column({ nullable: true })
  dateFin: Date;

  @Column({ nullable: true })
  dateLivraisonPrevue: Date;

  @Column({ nullable: true, type: 'float' })
  budgetEstime: number;

  @Column({ nullable: true, type: 'float' })
  budgetReel: number;

  @Column({ nullable: true })
  priorite: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true, type: 'jsonb' })
  equipements: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
