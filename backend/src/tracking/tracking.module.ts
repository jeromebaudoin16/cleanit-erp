import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingPosition } from './tracking.entity';
import { Pointage } from './pointage.entity';
import { Shift } from './shift.entity';
import { Alerte } from './alert.entity';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { TrackingGateway } from './tracking.gateway';

@Module({
  imports:[TypeOrmModule.forFeature([TrackingPosition,Pointage,Shift,Alerte])],
  providers:[TrackingService,TrackingGateway],
  controllers:[TrackingController],
  exports:[TrackingService],
})
export class TrackingModule {}
