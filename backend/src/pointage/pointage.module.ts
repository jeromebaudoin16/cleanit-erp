import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pointage } from './pointage.entity';
import { PointageService } from './pointage.service';
import { PointageController } from './pointage.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pointage])],
  providers: [PointageService],
  controllers: [PointageController],
  exports: [PointageService],
})
export class PointageModule {}
