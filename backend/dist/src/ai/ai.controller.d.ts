import { AiService } from './ai.service';
export declare class AiController {
    private svc;
    constructor(svc: AiService);
    findAll(): Promise<import("./ai.entity").Ai[]>;
    findOne(id: string): Promise<import("./ai.entity").Ai | null>;
    create(body: any): Promise<import("./ai.entity").Ai[]>;
    update(id: string, body: any): Promise<import("./ai.entity").Ai | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
