import { Repository } from 'typeorm';
import { Reports } from './report.entity';
export declare class ReportsService {
    private repo;
    constructor(repo: Repository<Reports>);
    findAll(): Promise<Reports[]>;
    findOne(id: number): Promise<Reports | null>;
    create(data: any): Promise<Reports[]>;
    update(id: number, data: any): Promise<Reports | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
