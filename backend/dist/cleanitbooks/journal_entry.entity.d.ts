import { JournalLine } from './journal_line.entity';
export declare class JournalEntry {
    id: string;
    numero: string;
    date: string;
    journal: string;
    libelle: string;
    pieceRef: string;
    pieceType: string;
    totalDebit: number;
    totalCredit: number;
    statut: string;
    fiscalYearId: string;
    createdBy: string;
    lines: JournalLine[];
    createdAt: Date;
}
