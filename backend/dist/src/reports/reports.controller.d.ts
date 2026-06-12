import { ReportsService } from './reports.service';
export declare class ReportsController {
    private svc;
    constructor(svc: ReportsService);
    findAll(): Promise<import("./report.entity").Reports[]>;
    findOne(id: string): Promise<import("./report.entity").Reports | null>;
    create(body: any): Promise<import("./report.entity").Reports[]>;
    update(id: string, body: any): Promise<import("./report.entity").Reports | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
