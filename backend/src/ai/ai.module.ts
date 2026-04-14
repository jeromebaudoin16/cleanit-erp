import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ai } from './ai.entity';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ai])],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
