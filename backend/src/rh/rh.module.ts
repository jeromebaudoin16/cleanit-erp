import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rh } from './rh.entity';
import { RhService } from './rh.service';
import { RhController } from './rh.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rh])],
  providers: [RhService],
  controllers: [RhController],
  exports: [RhService],
})
export class RhModule {}
