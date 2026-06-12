export declare class Invoice {
    id: string;
    customerId: string;
    jobId: string;
    date: string;
    dueDate: string;
    terms: string;
    poNumber: string;
    memo: string;
    currency: string;
    lines: object[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    amountPaid: number;
    balance: number;
    status: string;
    payments: object[];
    createdAt: Date;
    updatedAt: Date;
}
