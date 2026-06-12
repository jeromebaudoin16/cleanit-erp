import { MeteoService } from './meteo.service';
export declare class MeteoController {
    private svc;
    constructor(svc: MeteoService);
    findAll(): Promise<import("./meteo.entity").Meteo[]>;
    findOne(id: string): Promise<import("./meteo.entity").Meteo | null>;
    create(body: any): Promise<import("./meteo.entity").Meteo[]>;
    update(id: string, body: any): Promise<import("./meteo.entity").Meteo | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
