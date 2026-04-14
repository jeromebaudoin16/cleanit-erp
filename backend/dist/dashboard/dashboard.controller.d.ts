import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private svc;
    constructor(svc: DashboardService);
    getStats(): {
        sites: {
            total: number;
            actifs: number;
            alertes: number;
            critiques: number;
        };
        tickets: {
            total: number;
            ouverts: number;
            en_cours: number;
            resolus: number;
        };
        interventions: {
            total: number;
            planifiees: number;
            terminees: number;
            en_cours: number;
        };
        techniciens: {
            total: number;
            disponibles: number;
            en_mission: number;
        };
        reseau: {
            disponibilite: number;
            alarmes: number;
            latence: number;
            debit: number;
        };
        finance: {
            revenue: number;
            depenses: number;
            benefice: number;
            pending: number;
        };
    };
}
