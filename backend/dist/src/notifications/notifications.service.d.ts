import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
export declare class NotificationsService {
    private repo;
    constructor(repo: Repository<Notification>);
    findAll(): Promise<Notification[]>;
    findByUser(userId: number): Promise<Notification[]>;
    create(data: Partial<Notification>): Promise<Notification>;
    markRead(id: number): Promise<import("typeorm").UpdateResult>;
}
