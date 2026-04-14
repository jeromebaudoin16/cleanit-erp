import { SitesService } from './sites.service';
export declare class SitesController {
    private svc;
    constructor(svc: SitesService);
    findAll(): Promise<import("./site.entity").Site[]>;
    getStats(): Promise<{
        total: number;
        planifie: number;
        en_cours: number;
        termine: number;
        livre: number;
        en_retard: number;
    }>;
    findOne(id: string): Promise<import("./site.entity").Site | null>;
    create(body: any): Promise<import("./site.entity").Site>;
    update(id: string, body: any): Promise<import("./site.entity").Site | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
