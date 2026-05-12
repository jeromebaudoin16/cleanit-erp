import { JournalEntry } from './journal_entry.entity';
export declare class JournalLine {
    id: string;
    accountCode: string;
    accountNom: string;
    libelle: string;
    debit: number;
    credit: number;
    tiers: string;
    lettrage: string;
    jobId: string;
    entry: JournalEntry;
    entryId: string;
}
