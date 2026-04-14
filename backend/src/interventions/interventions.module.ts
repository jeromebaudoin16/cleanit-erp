import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interventions } from './intervention.entity';
import { InterventionsService } from './interventions.service';
import { InterventionsController } from './interventions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Interventions])],
  providers: [InterventionsService],
  controllers: [InterventionsController],
  exports: [InterventionsService],
})
export class InterventionsModule {}
