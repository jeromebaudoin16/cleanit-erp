import { CleanITBooksService } from './cleanitbooks.service';
import { AccountingService } from './accounting.service';
export declare class CleanITBooksController {
    private readonly svc;
    private readonly accountingService;
    constructor(svc: CleanITBooksService, accountingService: AccountingService);
    getDashboard(): Promise<{
        totalCA: number;
        totalAR: number;
        totalAP: number;
        totalContrats: number;
        jobsCount: number;
        jobsInProgress: number;
        customersCount: number;
        vendorsCount: number;
        invoicesCount: number;
        overdueInvoices: number;
    }>;
    getCustomers(): Promise<import("./customer.entity").Customer[]>;
    getCustomer(id: string): Promise<import("./customer.entity").Customer | null>;
    createCustomer(dto: any): Promise<Partial<import("./customer.entity").Customer> & import("./customer.entity").Customer>;
    updateCustomer(id: string, dto: any): Promise<import("typeorm").UpdateResult>;
    deleteCustomer(id: string): Promise<import("typeorm").DeleteResult>;
    getVendors(): Promise<import("./vendor.entity").Vendor[]>;
    getVendor(id: string): Promise<import("./vendor.entity").Vendor | null>;
    createVendor(dto: any): Promise<Partial<import("./vendor.entity").Vendor> & import("./vendor.entity").Vendor>;
    updateVendor(id: string, dto: any): Promise<import("typeorm").UpdateResult>;
    deleteVendor(id: string): Promise<import("typeorm").DeleteResult>;
    getJobs(): Promise<import("./job.entity").Job[]>;
    getJob(id: string): Promise<import("./job.entity").Job | null>;
    createJob(dto: any): Promise<Partial<import("./job.entity").Job> & import("./job.entity").Job>;
    updateJob(id: string, dto: any): Promise<import("typeorm").UpdateResult>;
    deleteJob(id: string): Promise<import("typeorm").DeleteResult>;
    getInvoices(): Promise<import("./invoice.entity").Invoice[]>;
    getInvoice(id: string): Promise<import("./invoice.entity").Invoice | null>;
    getInvByCustomer(id: string): Promise<import("./invoice.entity").Invoice[]>;
    getInvByJob(id: string): Promise<import("./invoice.entity").Invoice[]>;
    createInvoice(dto: any): Promise<Partial<import("./invoice.entity").Invoice> & import("./invoice.entity").Invoice>;
    updateInvoice(id: string, dto: any): Promise<import("typeorm").UpdateResult>;
    getBills(): Promise<import("./bill.entity").Bill[]>;
    getBill(id: string): Promise<import("./bill.entity").Bill | null>;
    getBillsByVendor(id: string): Promise<import("./bill.entity").Bill[]>;
    getBillsByJob(id: string): Promise<import("./bill.entity").Bill[]>;
    createBill(dto: any): Promise<Partial<import("./bill.entity").Bill> & import("./bill.entity").Bill>;
    updateBill(id: string, dto: any): Promise<import("typeorm").UpdateResult>;
    getTime(): Promise<import("./timeentry.entity").TimeEntry[]>;
    getTimeByJob(id: string): Promise<import("./timeentry.entity").TimeEntry[]>;
    getTimeByEmp(id: string): Promise<import("./timeentry.entity").TimeEntry[]>;
    createTime(dto: any): Promise<Partial<import("./timeentry.entity").TimeEntry> & import("./timeentry.entity").TimeEntry>;
    deleteTime(id: string): Promise<import("typeorm").DeleteResult>;
    getAccounts(classe?: string): Promise<import("./account.entity").Account[]>;
    initPlanComptable(): Promise<{
        message: string;
        count: number;
    }>;
    getJournal(type?: string): Promise<import("./journal_entry.entity").JournalEntry[]>;
    getGrandLivre(account?: string): Promise<Record<string, any[]>>;
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
    getPL(): Promise<{
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
    getPayments(type?: string): Promise<import("./payment.entity").Payment[]>;
    receivePayment(dto: any): Promise<{
        payment: import("./payment.entity").Payment;
        entry: import("./journal_entry.entity").JournalEntry;
        lettrage: string;
    }>;
    payBill(dto: any): Promise<{
        payment: import("./payment.entity").Payment;
        entry: import("./journal_entry.entity").JournalEntry;
    }>;
    getFiscalYears(): Promise<import("./fiscal_year.entity").FiscalYear[]>;
    createFiscalYear(dto: any): Promise<Partial<import("./fiscal_year.entity").FiscalYear> & import("./fiscal_year.entity").FiscalYear>;
    closeFiscalYear(id: string): Promise<{
        message: string;
    }>;
}
