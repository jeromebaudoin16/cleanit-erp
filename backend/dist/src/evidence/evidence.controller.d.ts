import { EvidenceService } from './evidence.service';
export declare class EvidenceController {
    private svc;
    constructor(svc: EvidenceService);
    findAll(): Promise<import("./evidence.entity").Evidence[]>;
    findOne(id: string): Promise<import("./evidence.entity").Evidence | null>;
    create(body: any): Promise<import("./evidence.entity").Evidence[]>;
    update(id: string, body: any): Promise<import("./evidence.entity").Evidence | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
