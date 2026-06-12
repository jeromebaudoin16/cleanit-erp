import { InterventionsService } from './interventions.service';
export declare class InterventionsController {
    private svc;
    constructor(svc: InterventionsService);
    findAll(): Promise<import("./intervention.entity").Interventions[]>;
    findOne(id: string): Promise<import("./intervention.entity").Interventions | null>;
    create(body: any): Promise<import("./intervention.entity").Interventions[]>;
    update(id: string, body: any): Promise<import("./intervention.entity").Interventions | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
