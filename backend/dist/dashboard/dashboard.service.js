"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
let DashboardService = class DashboardService {
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)()
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map