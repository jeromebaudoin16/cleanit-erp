import { TicketsService } from './tickets.service';
export declare class TicketsController {
    private svc;
    constructor(svc: TicketsService);
    findAll(): Promise<import("./ticket.entity").Tickets[]>;
    findOne(id: string): Promise<import("./ticket.entity").Tickets | null>;
    create(body: any): Promise<import("./ticket.entity").Tickets[]>;
    update(id: string, body: any): Promise<import("./ticket.entity").Tickets | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
