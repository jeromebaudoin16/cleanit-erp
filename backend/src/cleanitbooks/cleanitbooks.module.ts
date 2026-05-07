import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
import { Vendor } from './vendor.entity';
import { Job } from './job.entity';
import { Invoice } from './invoice.entity';
import { Bill } from './bill.entity';
import { TimeEntry } from './timeentry.entity';
import { CleanITBooksService } from './cleanitbooks.service';
import { CleanITBooksController } from './cleanitbooks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Vendor, Job, Invoice, Bill, TimeEntry])],
  providers: [CleanITBooksService],
  controllers: [CleanITBooksController],
  exports: [CleanITBooksService],
})
export class CleanITBooksModule {}
