import { Repository } from 'typeorm';
import { Rh } from './rh.entity';
export declare class RhService {
    private repo;
    constructor(repo: Repository<Rh>);
    findAll(): Promise<Rh[]>;
    findOne(id: number): Promise<Rh | null>;
    create(data: any): Promise<Rh[]>;
    update(id: number, data: any): Promise<Rh | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
