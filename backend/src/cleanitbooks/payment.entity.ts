import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('cib_payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() numero: string;         // PAY-2024-0001
  @Column() date: string;
  @Column() type: string;           // receipt|payment (encaissement|décaissement)
  @Column({ nullable: true }) customerId: string;
  @Column({ nullable: true }) vendorId: string;
  @Column({ nullable: true }) invoiceId: string;
  @Column({ nullable: true }) billId: string;
  @Column({ type: 'decimal', precision: 18, scale: 2 }) montant: number;
  @Column() methode: string;        // virement|cheque|especes|mobile_money
  @Column({ nullable: true }) reference: string;
  @Column({ nullable: true }) compteId: string;  // compte bancaire
  @Column({ nullable: true }) lettrage: string;   // code lettrage auto
  @Column({ default: 'posted' }) statut: string;
  @Column({ nullable: true }) journalEntryId: string;
  @Column({ nullable: true }) notes: string;
  @CreateDateColumn() createdAt: Date;
}
