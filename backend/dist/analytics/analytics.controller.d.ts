import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private svc;
    constructor(svc: AnalyticsService);
    findAll(): Promise<import("./analytic.entity").Analytics[]>;
    findOne(id: string): Promise<import("./analytic.entity").Analytics | null>;
    create(body: any): Promise<import("./analytic.entity").Analytics[]>;
    update(id: string, body: any): Promise<import("./analytic.entity").Analytics | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
