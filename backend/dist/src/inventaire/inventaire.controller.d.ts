import { InventaireService } from './inventaire.service';
export declare class InventaireController {
    private svc;
    constructor(svc: InventaireService);
    findAll(): Promise<import("./inventaire.entity").Inventaire[]>;
    findOne(id: string): Promise<import("./inventaire.entity").Inventaire | null>;
    create(body: any): Promise<import("./inventaire.entity").Inventaire[]>;
    update(id: string, body: any): Promise<import("./inventaire.entity").Inventaire | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
