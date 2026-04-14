import { Repository } from 'typeorm';
import { Planning } from './planning.entity';
export declare class PlanningService {
    private repo;
    constructor(repo: Repository<Planning>);
    findAll(): Promise<Planning[]>;
    findOne(id: number): Promise<Planning | null>;
    create(data: any): Promise<Planning[]>;
    update(id: number, data: any): Promise<Planning | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
