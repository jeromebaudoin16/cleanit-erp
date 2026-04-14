import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventaire } from './inventaire.entity';
import { InventaireService } from './inventaire.service';
import { InventaireController } from './inventaire.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Inventaire])],
  providers: [InventaireService],
  controllers: [InventaireController],
  exports: [InventaireService],
})
export class InventaireModule {}
