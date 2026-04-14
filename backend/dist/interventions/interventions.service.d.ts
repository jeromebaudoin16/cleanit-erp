import { Repository } from 'typeorm';
import { Interventions } from './intervention.entity';
export declare class InterventionsService {
    private repo;
    constructor(repo: Repository<Interventions>);
    findAll(): Promise<Interventions[]>;
    findOne(id: number): Promise<Interventions | null>;
    create(data: any): Promise<Interventions[]>;
    update(id: number, data: any): Promise<Interventions | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
