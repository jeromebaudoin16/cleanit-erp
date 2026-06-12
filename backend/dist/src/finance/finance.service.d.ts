import { Repository } from 'typeorm';
import { Finance } from './finance.entity';
export declare class FinanceService {
    private repo;
    constructor(repo: Repository<Finance>);
    findAll(): Promise<Finance[]>;
    findOne(id: number): Promise<Finance | null>;
    create(data: any): Promise<Finance[]>;
    update(id: number, data: any): Promise<Finance | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
