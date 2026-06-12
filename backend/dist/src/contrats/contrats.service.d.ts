import { Repository } from 'typeorm';
import { Contrats } from './contrat.entity';
export declare class ContratsService {
    private repo;
    constructor(repo: Repository<Contrats>);
    findAll(): Promise<Contrats[]>;
    findOne(id: number): Promise<Contrats | null>;
    create(data: any): Promise<Contrats[]>;
    update(id: number, data: any): Promise<Contrats | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
