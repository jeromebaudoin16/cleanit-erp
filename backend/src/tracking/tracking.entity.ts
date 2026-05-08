import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('tracking_positions')
@Index(['userId', 'timestamp'])
export class TrackingPosition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() userId: string;
  @Column() userName: string;
  @Column() userType: string; // 'interne' | 'externe'
  @Column({ type: 'float' }) lat: number;
  @Column({ type: 'float' }) lng: number;
  @Column({ type: 'float', nullable: true }) accuracy: number;
  @Column({ type: 'float', nullable: true }) speed: number;
  @Column({ nullable: true }) zoneCode: string;
  @Column({ default: false }) horsZone: boolean;
  @Column({ type: 'float', nullable: true }) distanceZone: number;
  @Column({ nullable: true }) deviceId: string;
  @Column({ nullable: true }) batteryLevel: number;
  @Column({ nullable: true }) networkType: string;
  @Column({ default: 'active' }) statut: string;
  @Column({ type: 'bigint' }) timestamp: number;

  @CreateDateColumn() createdAt: Date;
}
