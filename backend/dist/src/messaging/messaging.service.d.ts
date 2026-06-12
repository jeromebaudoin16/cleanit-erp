import { Repository } from 'typeorm';
import { Messaging } from './messaging.entity';
export declare class MessagingService {
    private repo;
    constructor(repo: Repository<Messaging>);
    findAll(): Promise<Messaging[]>;
    findOne(id: number): Promise<Messaging | null>;
    create(data: any): Promise<Messaging[]>;
    update(id: number, data: any): Promise<Messaging | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
