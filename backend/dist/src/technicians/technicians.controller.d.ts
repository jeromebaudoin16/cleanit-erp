import { TechniciansService } from './technicians.service';
export declare class TechniciansController {
    private svc;
    constructor(svc: TechniciansService);
    findAll(): Promise<import("./technician.entity").Technicians[]>;
    findOne(id: string): Promise<import("./technician.entity").Technicians | null>;
    create(body: any): Promise<import("./technician.entity").Technicians[]>;
    update(id: string, body: any): Promise<import("./technician.entity").Technicians | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
