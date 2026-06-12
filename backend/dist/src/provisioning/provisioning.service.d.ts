import { Repository } from 'typeorm';
import { Provisioning } from './provisioning.entity';
export declare class ProvisioningService {
    private repo;
    constructor(repo: Repository<Provisioning>);
    findAll(): Promise<Provisioning[]>;
    findOne(id: number): Promise<Provisioning | null>;
    create(data: any): Promise<Provisioning[]>;
    update(id: number, data: any): Promise<Provisioning | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
