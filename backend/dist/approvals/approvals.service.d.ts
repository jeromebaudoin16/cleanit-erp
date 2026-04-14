import { Repository } from 'typeorm';
import { Approval } from './approval.entity';
export declare class ApprovalsService {
    private repo;
    constructor(repo: Repository<Approval>);
    findAll(): Promise<Approval[]>;
    findOne(id: number): Promise<Approval | null>;
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
    create(data: any): Promise<Approval[]>;
    update(id: number, data: any): Promise<Approval | null>;
    submit(id: number, submittedBy: string, submittedByEmail: string): Promise<Approval | null>;
    review1(id: number, reviewer: string, reviewerEmail: string, decision: string, comment: string): Promise<Approval | null>;
    review2(id: number, reviewer: string, reviewerEmail: string, decision: string, comment: string): Promise<Approval | null>;
    bossApprove(id: number, boss: string, decision: string, comment: string): Promise<Approval | null>;
    markPaid(id: number, paymentRef: string, paymentMethod: string): Promise<Approval | null>;
    seedApprovals(): Promise<void>;
}
