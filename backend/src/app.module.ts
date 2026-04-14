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
import { UsersService } from './users/users.service';
import { SitesService } from './sites/sites.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST', 'localhost'),
        port: +cfg.get('DB_PORT', 5432),
        username: cfg.get('DB_USER', 'cleanit'),
        password: cfg.get('DB_PASS', 'cleanit2024'),
        database: cfg.get('DB_NAME', 'cleanit_erp'),
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
    ProvisioningModule, EvidenceModule, FinanceModule, RhModule, CrmModule,
    AnalyticsModule, BiModule, AiModule, MessagingModule, MeteoModule,
    ReportsModule, PurchaseOrdersModule, NotificationsModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private sitesService: SitesService,
  ) {}
  async onModuleInit() {
    await this.usersService.seedAdmin();
    await this.sitesService.seedSites();
  }
}
