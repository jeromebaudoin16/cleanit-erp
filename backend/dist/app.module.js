"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const sites_module_1 = require("./sites/sites.module");
const tickets_module_1 = require("./tickets/tickets.module");
const technicians_module_1 = require("./technicians/technicians.module");
const interventions_module_1 = require("./interventions/interventions.module");
const planning_module_1 = require("./planning/planning.module");
const inventaire_module_1 = require("./inventaire/inventaire.module");
const contrats_module_1 = require("./contrats/contrats.module");
const mediation_module_1 = require("./mediation/mediation.module");
const provisioning_module_1 = require("./provisioning/provisioning.module");
const evidence_module_1 = require("./evidence/evidence.module");
const finance_module_1 = require("./finance/finance.module");
const rh_module_1 = require("./rh/rh.module");
const crm_module_1 = require("./crm/crm.module");
const analytics_module_1 = require("./analytics/analytics.module");
const bi_module_1 = require("./bi/bi.module");
const ai_module_1 = require("./ai/ai.module");
const messaging_module_1 = require("./messaging/messaging.module");
const meteo_module_1 = require("./meteo/meteo.module");
const reports_module_1 = require("./reports/reports.module");
const purchase_orders_module_1 = require("./purchase-orders/purchase-orders.module");
const notifications_module_1 = require("./notifications/notifications.module");
const approvals_module_1 = require("./approvals/approvals.module");
const users_service_1 = require("./users/users.service");
const sites_service_1 = require("./sites/sites.service");
const approvals_service_1 = require("./approvals/approvals.service");
let AppModule = class AppModule {
    usersService;
    sitesService;
    approvalsService;
    constructor(usersService, sitesService, approvalsService) {
        this.usersService = usersService;
        this.sitesService = sitesService;
        this.approvalsService = approvalsService;
    }
    async onModuleInit() {
        await this.usersService.seedAdmin();
        await this.sitesService.seedSites();
        await this.approvalsService.seedApprovals();
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (cfg) => ({
                    type: 'postgres',
                    url: cfg.get('DATABASE_URL'),
                    ssl: { rejectUnauthorized: false },
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: true,
                    logging: false,
                }),
                inject: [config_1.ConfigService],
            }),
            schedule_1.ScheduleModule.forRoot(),
            auth_module_1.AuthModule, users_module_1.UsersModule, dashboard_module_1.DashboardModule,
            sites_module_1.SitesModule, tickets_module_1.TicketsModule, technicians_module_1.TechniciansModule, interventions_module_1.InterventionsModule,
            planning_module_1.PlanningModule, inventaire_module_1.InventaireModule, contrats_module_1.ContratsModule, mediation_module_1.MediationModule,
            provisioning_module_1.ProvisioningModule, evidence_module_1.EvidenceModule, finance_module_1.FinanceModule, rh_module_1.RhModule, crm_module_1.CrmModule,
            analytics_module_1.AnalyticsModule, bi_module_1.BiModule, ai_module_1.AiModule, messaging_module_1.MessagingModule, meteo_module_1.MeteoModule,
            reports_module_1.ReportsModule, purchase_orders_module_1.PurchaseOrdersModule, notifications_module_1.NotificationsModule, approvals_module_1.ApprovalsModule,
        ],
    }),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        sites_service_1.SitesService,
        approvals_service_1.ApprovalsService])
], AppModule);
//# sourceMappingURL=app.module.js.map