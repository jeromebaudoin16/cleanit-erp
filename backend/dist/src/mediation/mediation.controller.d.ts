import { MediationService } from './mediation.service';
export declare class MediationController {
    private svc;
    constructor(svc: MediationService);
    findAll(): Promise<import("./mediation.entity").Mediation[]>;
    findOne(id: string): Promise<import("./mediation.entity").Mediation | null>;
    create(body: any): Promise<import("./mediation.entity").Mediation[]>;
    update(id: string, body: any): Promise<import("./mediation.entity").Mediation | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
