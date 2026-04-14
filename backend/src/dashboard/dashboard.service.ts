import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  getStats() {
    return {
      sites: { total: 15, actifs: 11, alertes: 3, critiques: 1 },
      tickets: { total: 142, ouverts: 38, en_cours: 24, resolus: 80 },
      interventions: { total: 67, planifiees: 12, terminees: 47, en_cours: 8 },
      techniciens: { total: 24, disponibles: 18, en_mission: 6 },
      reseau: { disponibilite: 99.2, alarmes: 4, latence: 12, debit: 850 },
      finance: { revenue: 45000000, depenses: 12000000, benefice: 33000000, pending: 8500000 },
    };
  }
}
