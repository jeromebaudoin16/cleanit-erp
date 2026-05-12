import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CleanITBooksController } from './cleanitbooks.controller';
import { CleanITBooksService }    from './cleanitbooks.service';
import { AccountingService }      from './accounting.service';
import { Customer }    from './customer.entity';
import { Vendor }      from './vendor.entity';
import { Job }         from './job.entity';
import { Invoice }     from './invoice.entity';
import { Bill }        from './bill.entity';
import { TimeEntry }   from './timeentry.entity';
import { Account }     from './account.entity';
import { JournalEntry }from './journal_entry.entity';
import { JournalLine } from './journal_line.entity';
import { Payment }     from './payment.entity';
import { FiscalYear }  from './fiscal_year.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Customer, Vendor, Job, Invoice, Bill, TimeEntry,
    Account, JournalEntry, JournalLine, Payment, FiscalYear,
  ])],
  controllers: [CleanITBooksController],
  providers:   [CleanITBooksService, AccountingService],
  exports:     [CleanITBooksService, AccountingService],
})
export class CleanITBooksModule {}
