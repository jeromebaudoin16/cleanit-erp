import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mediation } from './mediation.entity';
import { MediationService } from './mediation.service';
import { MediationController } from './mediation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mediation])],
  providers: [MediationService],
  controllers: [MediationController],
  exports: [MediationService],
})
export class MediationModule {}
