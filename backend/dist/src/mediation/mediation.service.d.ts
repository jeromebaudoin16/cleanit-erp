import { Repository } from 'typeorm';
import { Mediation } from './mediation.entity';
export declare class MediationService {
    private repo;
    constructor(repo: Repository<Mediation>);
    findAll(): Promise<Mediation[]>;
    findOne(id: number): Promise<Mediation | null>;
    create(data: any): Promise<Mediation[]>;
    update(id: number, data: any): Promise<Mediation | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
