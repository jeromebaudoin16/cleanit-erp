export declare class Job {
    id: string;
    name: string;
    customerId: string;
    bcRef: string;
    jobType: string;
    statut: string;
    site: string;
    chefProjet: string;
    startDate: string;
    endDate: string;
    currency: string;
    description: string;
    notes: string;
    budgetHuawei: number;
    contractAmount: number;
    budgetEstime: object;
    coutsReels: object;
    phases: object[];
    lignesBC: object[];
    createdAt: Date;
    updatedAt: Date;
}
