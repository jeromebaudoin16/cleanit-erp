import { Repository } from 'typeorm';
import { Pointage } from './pointage.entity';
import { CreatePointageDto, GetPointagesDto } from './pointage.dto';
export declare class PointageService {
    private pointageRepo;
    constructor(pointageRepo: Repository<Pointage>);
    pointer(dto: CreatePointageDto): Promise<Pointage>;
    getPointages(query: GetPointagesDto): Promise<{
        data: Pointage[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPointagesJour(userId: string, date?: string): Promise<Pointage[]>;
    getStats(dateDebut?: string, dateFin?: string): Promise<{
        total: number;
        horsZone: number;
        parEmploye: unknown[];
        pointagesRecents: Pointage[];
    }>;
    getDernierPointage(userId: string): Promise<Pointage | null>;
    validerPointage(id: string, validePar: string): Promise<Pointage | null>;
    getPresenceTempsReel(): Promise<unknown[]>;
}
