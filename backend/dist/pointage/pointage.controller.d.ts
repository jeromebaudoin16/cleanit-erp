import { PointageService } from './pointage.service';
import { CreatePointageDto, GetPointagesDto } from './pointage.dto';
export declare class PointageController {
    private readonly pointageService;
    constructor(pointageService: PointageService);
    pointer(dto: CreatePointageDto): Promise<import("./pointage.entity").Pointage>;
    getPointages(query: GetPointagesDto): Promise<{
        data: import("./pointage.entity").Pointage[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStats(dateDebut?: string, dateFin?: string): Promise<{
        total: number;
        horsZone: number;
        parEmploye: unknown[];
        pointagesRecents: import("./pointage.entity").Pointage[];
    }>;
    getPresenceTempsReel(): Promise<unknown[]>;
    getPointagesJour(userId: string, date?: string): Promise<import("./pointage.entity").Pointage[]>;
    getDernierPointage(userId: string): Promise<import("./pointage.entity").Pointage | null>;
    valider(id: string, validePar: string): Promise<import("./pointage.entity").Pointage | null>;
}
