import { Repository } from 'typeorm';
import { Inventaire } from './inventaire.entity';
export declare class InventaireService {
    private repo;
    constructor(repo: Repository<Inventaire>);
    findAll(): Promise<Inventaire[]>;
    findOne(id: number): Promise<Inventaire | null>;
    create(data: any): Promise<Inventaire[]>;
    update(id: number, data: any): Promise<Inventaire | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
