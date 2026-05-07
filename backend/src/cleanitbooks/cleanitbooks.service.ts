import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { Vendor } from './vendor.entity';
import { Job } from './job.entity';
import { Invoice } from './invoice.entity';
import { Bill } from './bill.entity';
import { TimeEntry } from './timeentry.entity';

@Injectable()
export class CleanITBooksService {

  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Vendor)   private vendorRepo:   Repository<Vendor>,
    @InjectRepository(Job)      private jobRepo:      Repository<Job>,
    @InjectRepository(Invoice)  private invoiceRepo:  Repository<Invoice>,
    @InjectRepository(Bill)     private billRepo:     Repository<Bill>,
    @InjectRepository(TimeEntry)private timeRepo:     Repository<TimeEntry>,
  ) {}

  // ===== CUSTOMERS =====
  findAllCustomers()                { return this.customerRepo.find(); }
  findCustomer(id: string)          { return this.customerRepo.findOneBy({id}); }
  createCustomer(dto: Partial<Customer>) { return this.customerRepo.save(dto); }
  updateCustomer(id: string, dto: Partial<Customer>) { return this.customerRepo.update(id, dto); }
  deleteCustomer(id: string)        { return this.customerRepo.delete(id); }

  // ===== VENDORS =====
  findAllVendors()                  { return this.vendorRepo.find(); }
  findVendor(id: string)            { return this.vendorRepo.findOneBy({id}); }
  createVendor(dto: Partial<Vendor>){ return this.vendorRepo.save(dto); }
  updateVendor(id: string, dto: Partial<Vendor>) { return this.vendorRepo.update(id, dto); }
  deleteVendor(id: string)          { return this.vendorRepo.delete(id); }

  // ===== JOBS =====
  findAllJobs()                     { return this.jobRepo.find({order:{createdAt:'DESC'}}); }
  findJob(id: string)               { return this.jobRepo.findOneBy({id}); }
  createJob(dto: Partial<Job>)      { return this.jobRepo.save(dto); }
  updateJob(id: string, dto: Partial<Job>) { return this.jobRepo.update(id, dto); }
  deleteJob(id: string)             { return this.jobRepo.delete(id); }

  // ===== INVOICES =====
  findAllInvoices()                 { return this.invoiceRepo.find({order:{createdAt:'DESC'}}); }
  findInvoicesByCustomer(customerId: string) { return this.invoiceRepo.findBy({customerId}); }
  findInvoicesByJob(jobId: string)  { return this.invoiceRepo.findBy({jobId}); }
  findInvoice(id: string)           { return this.invoiceRepo.findOneBy({id}); }
  createInvoice(dto: Partial<Invoice>) { return this.invoiceRepo.save(dto); }
  updateInvoice(id: string, dto: Partial<Invoice>) { return this.invoiceRepo.update(id, dto); }

  // ===== BILLS =====
  findAllBills()                    { return this.billRepo.find({order:{createdAt:'DESC'}}); }
  findBillsByVendor(vendorId: string){ return this.billRepo.findBy({vendorId}); }
  findBillsByJob(jobId: string)     { return this.billRepo.findBy({jobId}); }
  findBill(id: string)              { return this.billRepo.findOneBy({id}); }
  createBill(dto: Partial<Bill>)    { return this.billRepo.save(dto); }
  updateBill(id: string, dto: Partial<Bill>) { return this.billRepo.update(id, dto); }

  // ===== TIME ENTRIES =====
  findAllTimeEntries()              { return this.timeRepo.find({order:{createdAt:'DESC'}}); }
  findTimeByJob(jobId: string)      { return this.timeRepo.findBy({jobId}); }
  findTimeByEmp(empId: string)      { return this.timeRepo.findBy({empId}); }
  createTimeEntry(dto: Partial<TimeEntry>) { return this.timeRepo.save(dto); }
  deleteTimeEntry(id: string)       { return this.timeRepo.delete(id); }

  // ===== DASHBOARD KPIs =====
  async getDashboardKpis() {
    const [jobs, invoices, bills, customers, vendors] = await Promise.all([
      this.jobRepo.find(),
      this.invoiceRepo.find(),
      this.billRepo.find(),
      this.customerRepo.find(),
      this.vendorRepo.find(),
    ]);

    const totalCA      = invoices.reduce((s,i)=>s+Number(i.total),0);
    const totalAR      = invoices.reduce((s,i)=>s+Number(i.balance),0);
    const totalAP      = bills.reduce((s,b)=>s+Number(b.balance),0);
    const totalContrats= jobs.reduce((s,j)=>s+Number(j.contractAmount),0);
    const jobsInProgress = jobs.filter(j=>j.statut==='In Progress').length;

    return {
      totalCA, totalAR, totalAP, totalContrats,
      jobsCount: jobs.length, jobsInProgress,
      customersCount: customers.length,
      vendorsCount: vendors.length,
      invoicesCount: invoices.length,
      overdueInvoices: invoices.filter(i=>i.status==='Overdue').length,
    };
  }
}
