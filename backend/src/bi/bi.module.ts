import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bi } from './bi.entity';
import { BiService } from './bi.service';
import { BiController } from './bi.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Bi])],
  providers: [BiService],
  controllers: [BiController],
  exports: [BiService],
})
export class BiModule {}
