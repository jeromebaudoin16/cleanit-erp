import { FinanceService } from './finance.service';
export declare class FinanceController {
    private svc;
    constructor(svc: FinanceService);
    findAll(): Promise<import("./finance.entity").Finance[]>;
    findOne(id: string): Promise<import("./finance.entity").Finance | null>;
    create(body: any): Promise<import("./finance.entity").Finance[]>;
    update(id: string, body: any): Promise<import("./finance.entity").Finance | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
