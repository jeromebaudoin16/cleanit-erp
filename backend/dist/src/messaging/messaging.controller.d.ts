import { MessagingService } from './messaging.service';
export declare class MessagingController {
    private svc;
    constructor(svc: MessagingService);
    findAll(): Promise<import("./messaging.entity").Messaging[]>;
    findOne(id: string): Promise<import("./messaging.entity").Messaging | null>;
    create(body: any): Promise<import("./messaging.entity").Messaging[]>;
    update(id: string, body: any): Promise<import("./messaging.entity").Messaging | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
