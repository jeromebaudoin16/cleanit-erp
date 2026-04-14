import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('meteo')
export class Meteo {
  @PrimaryGeneratedColumn() id: number;
  @Column({ nullable: true }) name: string;
  @Column({ nullable: true }) description: string;
  @Column({ nullable: true }) status: string;
  @Column({ nullable: true }) code: string;
  @Column({ nullable: true, type: 'jsonb' }) metadata: any;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
