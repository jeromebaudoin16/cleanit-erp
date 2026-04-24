import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SitesModule } from './sites/sites.module';
import { TicketsModule } from './tickets/tickets.module';
import { TechniciansModule } from './technicians/technicians.module';
import { InterventionsModule } from './interventions/interventions.module';
import { PlanningModule } from './planning/planning.module';
import { InventaireModule } from './inventaire/inventaire.module';
import { ContratsModule } from './contrats/contrats.module';
import { MediationModule } from './mediation/mediation.module';
import { ProvisioningModule } from './provisioning/provisioning.module';
import { EvidenceModule } from './evidence/evidence.module';
import { FinanceModule } from './finance/finance.module';
import { PointageModule } from './pointage/pointage.module';
import { RhModule } from './rh/rh.module';
import { CrmModule } from './crm/crm.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BiModule } from './bi/bi.module';
import { AiModule } from './ai/ai.module';
import { MessagingModule } from './messaging/messaging.module';
import { MeteoModule } from './meteo/meteo.module';
import { ReportsModule } from './reports/reports.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { UsersService } from './users/users.service';
import { SitesService } from './sites/sites.service';
import { ApprovalsService } from './approvals/approvals.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        url: cfg.get('DATABASE_URL'),
        ssl: { rejectUnauthorized: false },
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule, UsersModule, DashboardModule,
    SitesModule, TicketsModule, TechniciansModule, InterventionsModule,
    PlanningModule, InventaireModule, ContratsModule, MediationModule,
    ProvisioningModule, EvidenceModule, FinanceModule, PointageModule,
    RhModule, CrmModule,
    AnalyticsModule, BiModule, AiModule, MessagingModule, MeteoModule,
    ReportsModule, PurchaseOrdersModule, NotificationsModule, ApprovalsModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private sitesService: SitesService,
    private approvalsService: ApprovalsService,
  ) {}
  async onModuleInit() {
    await this.usersService.seedAdmin();
    await this.sitesService.seedSites();
    await this.approvalsService.seedApprovals();
  }
}
