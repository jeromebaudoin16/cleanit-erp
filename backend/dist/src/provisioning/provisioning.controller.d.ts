import { ProvisioningService } from './provisioning.service';
export declare class ProvisioningController {
    private svc;
    constructor(svc: ProvisioningService);
    findAll(): Promise<import("./provisioning.entity").Provisioning[]>;
    findOne(id: string): Promise<import("./provisioning.entity").Provisioning | null>;
    create(body: any): Promise<import("./provisioning.entity").Provisioning[]>;
    update(id: string, body: any): Promise<import("./provisioning.entity").Provisioning | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
