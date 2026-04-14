import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('approvals')
export class Approval {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  reference: string;
  @Column({ default: 'payment_request' })
  type: string;
  @Column({ default: 'draft' })
  status: string;
  @Column({ nullable: true }) projectName: string;
  @Column({ nullable: true }) projectCode: string;
  @Column({ nullable: true }) poNumber: string;
  @Column({ nullable: true }) siteCode: string;
  @Column({ type: 'float', default: 0 }) amount: number;
  @Column({ nullable: true }) currency: string;
  @Column({ nullable: true }) description: string;
  @Column({ nullable: true }) justification: string;
  @Column({ nullable: true }) beneficiaryName: string;
  @Column({ nullable: true }) beneficiaryEmail: string;
  @Column({ nullable: true }) beneficiaryPhone: string;
  @Column({ nullable: true }) beneficiaryBank: string;
  @Column({ nullable: true }) beneficiaryAccount: string;
  @Column({ nullable: true }) beneficiaryMobile: string;
  @Column({ nullable: true }) submittedBy: string;
  @Column({ nullable: true }) submittedByEmail: string;
  @Column({ nullable: true }) submittedAt: Date;
  @Column({ nullable: true }) reviewer1: string;
  @Column({ nullable: true }) reviewer1Email: string;
  @Column({ nullable: true }) reviewer1At: Date;
  @Column({ nullable: true }) reviewer1Comment: string;
  @Column({ nullable: true }) reviewer1Decision: string;
  @Column({ nullable: true }) reviewer2: string;
  @Column({ nullable: true }) reviewer2Email: string;
  @Column({ nullable: true }) reviewer2At: Date;
  @Column({ nullable: true }) reviewer2Comment: string;
  @Column({ nullable: true }) reviewer2Decision: string;
  @Column({ nullable: true }) approvedBy: string;
  @Column({ nullable: true }) approvedAt: Date;
  @Column({ nullable: true }) approvalComment: string;
  @Column({ nullable: true }) paidAt: Date;
  @Column({ nullable: true }) paymentReference: string;
  @Column({ nullable: true }) paymentMethod: string;
  @Column({ default: false }) autoApproved: boolean;
  @Column({ nullable: true, type: 'jsonb' }) history: any[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
