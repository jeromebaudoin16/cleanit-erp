import { Repository } from 'typeorm';
import { Ai } from './ai.entity';
export declare class AiService {
    private repo;
    constructor(repo: Repository<Ai>);
    findAll(): Promise<Ai[]>;
    findOne(id: number): Promise<Ai | null>;
    create(data: any): Promise<Ai[]>;
    update(id: number, data: any): Promise<Ai | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
