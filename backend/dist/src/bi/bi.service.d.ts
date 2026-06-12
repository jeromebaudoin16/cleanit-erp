import { Repository } from 'typeorm';
import { Bi } from './bi.entity';
export declare class BiService {
    private repo;
    constructor(repo: Repository<Bi>);
    findAll(): Promise<Bi[]>;
    findOne(id: number): Promise<Bi | null>;
    create(data: any): Promise<Bi[]>;
    update(id: number, data: any): Promise<Bi | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
