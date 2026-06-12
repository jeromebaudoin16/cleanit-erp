import { Repository } from 'typeorm';
import { Meteo } from './meteo.entity';
export declare class MeteoService {
    private repo;
    constructor(repo: Repository<Meteo>);
    findAll(): Promise<Meteo[]>;
    findOne(id: number): Promise<Meteo | null>;
    create(data: any): Promise<Meteo[]>;
    update(id: number, data: any): Promise<Meteo | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
