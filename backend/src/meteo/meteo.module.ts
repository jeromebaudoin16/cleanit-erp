import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meteo } from './meteo.entity';
import { MeteoService } from './meteo.service';
import { MeteoController } from './meteo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Meteo])],
  providers: [MeteoService],
  controllers: [MeteoController],
  exports: [MeteoService],
})
export class MeteoModule {}
