import { Repository } from 'typeorm';
import { Analytics } from './analytic.entity';
export declare class AnalyticsService {
    private repo;
    constructor(repo: Repository<Analytics>);
    findAll(): Promise<Analytics[]>;
    findOne(id: number): Promise<Analytics | null>;
    create(data: any): Promise<Analytics[]>;
    update(id: number, data: any): Promise<Analytics | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
