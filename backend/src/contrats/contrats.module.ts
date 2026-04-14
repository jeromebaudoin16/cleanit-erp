import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contrats } from './contrat.entity';
import { ContratsService } from './contrats.service';
import { ContratsController } from './contrats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contrats])],
  providers: [ContratsService],
  controllers: [ContratsController],
  exports: [ContratsService],
})
export class ContratsModule {}
