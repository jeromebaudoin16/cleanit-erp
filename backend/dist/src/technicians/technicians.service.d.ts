import { Repository } from 'typeorm';
import { Technicians } from './technician.entity';
export declare class TechniciansService {
    private repo;
    constructor(repo: Repository<Technicians>);
    findAll(): Promise<Technicians[]>;
    findOne(id: number): Promise<Technicians | null>;
    create(data: any): Promise<Technicians[]>;
    update(id: number, data: any): Promise<Technicians | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
