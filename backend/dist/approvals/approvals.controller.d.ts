import { ApprovalsService } from './approvals.service';
export declare class ApprovalsController {
    private svc;
    constructor(svc: ApprovalsService);
    findAll(): Promise<import("./approval.entity").Approval[]>;
    getStats(): Promise<{
        total: number;
        submitted: number;
        in_review: number;
        pending_boss: number;
        approved: number;
        paid: number;
        rejected: number;
        totalAmount: number;
        pendingAmount: number;
    }>;
    findOne(id: string): Promise<import("./approval.entity").Approval | null>;
    create(body: any): Promise<import("./approval.entity").Approval[]>;
    update(id: string, body: any): Promise<import("./approval.entity").Approval | null>;
    submit(id: string, b: any): Promise<import("./approval.entity").Approval | null>;
    review1(id: string, b: any): Promise<import("./approval.entity").Approval | null>;
    review2(id: string, b: any): Promise<import("./approval.entity").Approval | null>;
    bossApprove(id: string, b: any): Promise<import("./approval.entity").Approval | null>;
    markPaid(id: string, b: any): Promise<import("./approval.entity").Approval | null>;
}
