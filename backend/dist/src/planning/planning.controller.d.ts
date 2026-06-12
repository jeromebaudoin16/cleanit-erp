import { PlanningService } from './planning.service';
export declare class PlanningController {
    private svc;
    constructor(svc: PlanningService);
    findAll(): Promise<import("./planning.entity").Planning[]>;
    findOne(id: string): Promise<import("./planning.entity").Planning | null>;
    create(body: any): Promise<import("./planning.entity").Planning[]>;
    update(id: string, body: any): Promise<import("./planning.entity").Planning | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
