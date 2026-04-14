import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provisioning } from './provisioning.entity';
import { ProvisioningService } from './provisioning.service';
import { ProvisioningController } from './provisioning.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Provisioning])],
  providers: [ProvisioningService],
  controllers: [ProvisioningController],
  exports: [ProvisioningService],
})
export class ProvisioningModule {}
