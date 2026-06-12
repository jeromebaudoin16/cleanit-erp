import { Repository } from 'typeorm';
import { Crm } from './crm.entity';
export declare class CrmService {
    private repo;
    constructor(repo: Repository<Crm>);
    findAll(): Promise<Crm[]>;
    findOne(id: number): Promise<Crm | null>;
    create(data: any): Promise<Crm[]>;
    update(id: number, data: any): Promise<Crm | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
