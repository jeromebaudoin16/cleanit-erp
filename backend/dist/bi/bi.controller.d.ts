import { BiService } from './bi.service';
export declare class BiController {
    private svc;
    constructor(svc: BiService);
    findAll(): Promise<import("./bi.entity").Bi[]>;
    findOne(id: string): Promise<import("./bi.entity").Bi | null>;
    create(body: any): Promise<import("./bi.entity").Bi[]>;
    update(id: string, body: any): Promise<import("./bi.entity").Bi | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
