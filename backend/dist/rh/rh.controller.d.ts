import { RhService } from './rh.service';
export declare class RhController {
    private svc;
    constructor(svc: RhService);
    findAll(): Promise<import("./rh.entity").Rh[]>;
    findOne(id: string): Promise<import("./rh.entity").Rh | null>;
    create(body: any): Promise<import("./rh.entity").Rh[]>;
    update(id: string, body: any): Promise<import("./rh.entity").Rh | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
