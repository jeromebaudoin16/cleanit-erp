import { Repository } from 'typeorm';
import { Evidence } from './evidence.entity';
export declare class EvidenceService {
    private repo;
    constructor(repo: Repository<Evidence>);
    findAll(): Promise<Evidence[]>;
    findOne(id: number): Promise<Evidence | null>;
    create(data: any): Promise<Evidence[]>;
    update(id: number, data: any): Promise<Evidence | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
