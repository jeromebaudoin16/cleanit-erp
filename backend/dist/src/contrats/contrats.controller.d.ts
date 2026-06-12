import { ContratsService } from './contrats.service';
export declare class ContratsController {
    private svc;
    constructor(svc: ContratsService);
    findAll(): Promise<import("./contrat.entity").Contrats[]>;
    findOne(id: string): Promise<import("./contrat.entity").Contrats | null>;
    create(body: any): Promise<import("./contrat.entity").Contrats[]>;
    update(id: string, body: any): Promise<import("./contrat.entity").Contrats | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
