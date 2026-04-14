import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Planning } from './planning.entity';
import { PlanningService } from './planning.service';
import { PlanningController } from './planning.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Planning])],
  providers: [PlanningService],
  controllers: [PlanningController],
  exports: [PlanningService],
})
export class PlanningModule {}
