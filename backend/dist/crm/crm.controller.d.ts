import { CrmService } from './crm.service';
export declare class CrmController {
    private svc;
    constructor(svc: CrmService);
    findAll(): Promise<import("./crm.entity").Crm[]>;
    findOne(id: string): Promise<import("./crm.entity").Crm | null>;
    create(body: any): Promise<import("./crm.entity").Crm[]>;
    update(id: string, body: any): Promise<import("./crm.entity").Crm | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
