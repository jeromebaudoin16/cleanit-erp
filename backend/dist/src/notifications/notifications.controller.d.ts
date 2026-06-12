import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private svc;
    constructor(svc: NotificationsService);
    findAll(req: any): Promise<import("./notification.entity").Notification[]>;
    markRead(id: string): Promise<import("typeorm").UpdateResult>;
}
