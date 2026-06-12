import { Repository } from 'typeorm';
import { Site } from './site.entity';
export declare class SitesService {
    private repo;
    constructor(repo: Repository<Site>);
    findAll(): Promise<Site[]>;
    findOne(id: number): Promise<Site | null>;
    findByCode(code: string): Promise<Site | null>;
    create(data: Partial<Site>): Promise<Site>;
    update(id: number, data: Partial<Site>): Promise<Site | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
    getStats(): Promise<{
        total: number;
        planifie: number;
        en_cours: number;
        termine: number;
        livre: number;
        en_retard: number;
    }>;
    seedSites(): Promise<void>;
}
