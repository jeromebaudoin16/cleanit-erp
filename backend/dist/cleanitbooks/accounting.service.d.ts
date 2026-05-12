import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { JournalEntry } from './journal_entry.entity';
import { JournalLine } from './journal_line.entity';
import { Payment } from './payment.entity';
import { FiscalYear } from './fiscal_year.entity';
import { Invoice } from './invoice.entity';
import { Bill } from './bill.entity';
export declare class AccountingService {
    private accountRepo;
    private jnlRepo;
    private lineRepo;
    private paymentRepo;
    private fyRepo;
    private invoiceRepo;
    private billRepo;
    private jnlCounter;
    private payCounter;
    constructor(accountRepo: Repository<Account>, jnlRepo: Repository<JournalEntry>, lineRepo: Repository<JournalLine>, paymentRepo: Repository<Payment>, fyRepo: Repository<FiscalYear>, invoiceRepo: Repository<Invoice>, billRepo: Repository<Bill>);
    initPlanComptable(): Promise<{
        message: string;
        count: number;
    }>;
    findAllAccounts(): Promise<Account[]>;
    findAccountsByClasse(classe: string): Promise<Account[]>;
    updateAccountBalance(code: string, debit: number, credit: number): Promise<Account | undefined>;
    private nextJnlNum;
    private nextPayNum;
    generateInvoiceEntry(invoice: any): Promise<JournalEntry>;
    generateBillEntry(bill: any): Promise<JournalEntry>;
    receivePayment(dto: {
        customerId: string;
        invoiceId: string;
        montant: number;
        methode: string;
        reference: string;
        date: string;
    }): Promise<{
        payment: Payment;
        entry: JournalEntry;
        lettrage: string;
    }>;
    payBill(dto: {
        vendorId: string;
        billId: string;
        montant: number;
        methode: string;
        reference: string;
        date: string;
    }): Promise<{
        payment: Payment;
        entry: JournalEntry;
    }>;
    getGrandLivre(accountCode?: string, dateDebut?: string, dateFin?: string): Promise<Record<string, any[]>>;
    getBalance(): Promise<{
        rows: {
            code: string;
            nom: string;
            classe: string;
            type: string;
            debit: number;
            credit: number;
            solde: number;
        }[];
        totalDebit: number;
        totalCredit: number;
        equilibre: boolean;
    }>;
    getPL(dateDebut?: string, dateFin?: string): Promise<{
        produits: {
            code: string;
            nom: string;
            montant: number;
        }[];
        charges: {
            code: string;
            nom: string;
            montant: number;
        }[];
        totalProduits: number;
        totalCharges: number;
        resultat: number;
        beneficiaire: boolean;
    }>;
    getBilan(): Promise<{
        actif: {
            code: string;
            nom: string;
            classe: string;
            solde: number;
        }[];
        passif: {
            code: string;
            nom: string;
            classe: string;
            solde: number;
        }[];
        totalActif: number;
        totalPassif: number;
        equilibre: boolean;
    }>;
    findJournal(journal?: string): Promise<JournalEntry[]>;
    findPayments(type?: string): Promise<Payment[]>;
    findFiscalYears(): Promise<FiscalYear[]>;
    createFiscalYear(dto: Partial<FiscalYear>): Promise<Partial<FiscalYear> & FiscalYear>;
    closeFiscalYear(id: string): Promise<{
        message: string;
    }>;
}
