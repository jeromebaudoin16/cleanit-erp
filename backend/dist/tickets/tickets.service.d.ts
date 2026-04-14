import { Repository } from 'typeorm';
import { Tickets } from './ticket.entity';
export declare class TicketsService {
    private repo;
    constructor(repo: Repository<Tickets>);
    findAll(): Promise<Tickets[]>;
    findOne(id: number): Promise<Tickets | null>;
    create(data: any): Promise<Tickets[]>;
    update(id: number, data: any): Promise<Tickets | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
