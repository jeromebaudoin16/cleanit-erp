export declare class Bill {
    id: string;
    vendorId: string;
    date: string;
    dueDate: string;
    refNum: string;
    memo: string;
    currency: string;
    jobId: string;
    lines: object[];
    total: number;
    amountPaid: number;
    balance: number;
    status: string;
    payments: object[];
    createdAt: Date;
    updatedAt: Date;
}
