import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CleanITBooksService } from './cleanitbooks.service';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/cleanitbooks')
@UseGuards(JwtAuthGuard)
export class CleanITBooksController {
  constructor(private readonly svc: CleanITBooksService, private readonly accountingService: AccountingService) {}

  // Dashboard
  @Get('dashboard') getDashboard() { return this.svc.getDashboardKpis(); }

  // Customers
  @Get('customers')              getCustomers()                          { return this.svc.findAllCustomers(); }
  @Get('customers/:id')          getCustomer(@Param('id') id: string)   { return this.svc.findCustomer(id); }
  @Post('customers')             createCustomer(@Body() dto: any)        { return this.svc.createCustomer(dto); }
  @Put('customers/:id')          updateCustomer(@Param('id') id: string, @Body() dto: any) { return this.svc.updateCustomer(id, dto); }
  @Delete('customers/:id')       deleteCustomer(@Param('id') id: string) { return this.svc.deleteCustomer(id); }

  // Vendors
  @Get('vendors')                getVendors()                            { return this.svc.findAllVendors(); }
  @Get('vendors/:id')            getVendor(@Param('id') id: string)     { return this.svc.findVendor(id); }
  @Post('vendors')               createVendor(@Body() dto: any)          { return this.svc.createVendor(dto); }
  @Put('vendors/:id')            updateVendor(@Param('id') id: string, @Body() dto: any) { return this.svc.updateVendor(id, dto); }
  @Delete('vendors/:id')         deleteVendor(@Param('id') id: string)   { return this.svc.deleteVendor(id); }

  // Jobs
  @Get('jobs')                   getJobs()                               { return this.svc.findAllJobs(); }
  @Get('jobs/:id')               getJob(@Param('id') id: string)        { return this.svc.findJob(id); }
  @Post('jobs')                  createJob(@Body() dto: any)             { return this.svc.createJob(dto); }
  @Put('jobs/:id')               updateJob(@Param('id') id: string, @Body() dto: any) { return this.svc.updateJob(id, dto); }
  @Delete('jobs/:id')            deleteJob(@Param('id') id: string)      { return this.svc.deleteJob(id); }

  // Invoices
  @Get('invoices')               getInvoices()                           { return this.svc.findAllInvoices(); }
  @Get('invoices/:id')           getInvoice(@Param('id') id: string)    { return this.svc.findInvoice(id); }
  @Get('invoices/customer/:id')  getInvByCustomer(@Param('id') id: string) { return this.svc.findInvoicesByCustomer(id); }
  @Get('invoices/job/:id')       getInvByJob(@Param('id') id: string)   { return this.svc.findInvoicesByJob(id); }
  @Post('invoices')              createInvoice(@Body() dto: any)         { return this.svc.createInvoice(dto); }
  @Put('invoices/:id')           updateInvoice(@Param('id') id: string, @Body() dto: any) { return this.svc.updateInvoice(id, dto); }

  // Bills
  @Get('bills')                  getBills()                              { return this.svc.findAllBills(); }
  @Get('bills/:id')              getBill(@Param('id') id: string)       { return this.svc.findBill(id); }
  @Get('bills/vendor/:id')       getBillsByVendor(@Param('id') id: string) { return this.svc.findBillsByVendor(id); }
  @Get('bills/job/:id')          getBillsByJob(@Param('id') id: string) { return this.svc.findBillsByJob(id); }
  @Post('bills')                 createBill(@Body() dto: any)            { return this.svc.createBill(dto); }
  @Put('bills/:id')              updateBill(@Param('id') id: string, @Body() dto: any) { return this.svc.updateBill(id, dto); }

  // Time Entries
  @Get('time')                   getTime()                               { return this.svc.findAllTimeEntries(); }
  @Get('time/job/:id')           getTimeByJob(@Param('id') id: string)  { return this.svc.findTimeByJob(id); }
  @Get('time/emp/:id')           getTimeByEmp(@Param('id') id: string)  { return this.svc.findTimeByEmp(id); }
  @Post('time')                  createTime(@Body() dto: any)            { return this.svc.createTimeEntry(dto); }
  @Delete('time/:id')            deleteTime(@Param('id') id: string)     { return this.svc.deleteTimeEntry(id); }
  // ── Plan comptable ───────────────────────────────────────────────
  @Get('accounts')
  getAccounts(@Query('classe') classe?: string) {
    if(classe) return this.accountingService.findAccountsByClasse(classe);
    return this.accountingService.findAllAccounts();
  }
  @Post('accounts/init')
  initPlanComptable() { return this.accountingService.initPlanComptable(); }

  // ── Journal ──────────────────────────────────────────────────────
  @Get('journal')
  getJournal(@Query('type') type?: string) { return this.accountingService.findJournal(type); }

  // ── Grand Livre ──────────────────────────────────────────────────
  @Get('grandlivre')
  getGrandLivre(@Query('account') account?: string) { return this.accountingService.getGrandLivre(account); }

  // ── Balance ──────────────────────────────────────────────────────
  @Get('balance')
  getBalance() { return this.accountingService.getBalance(); }

  // ── P&L ─────────────────────────────────────────────────────────
  @Get('pl')
  getPL() { return this.accountingService.getPL(); }

  // ── Bilan ────────────────────────────────────────────────────────
  @Get('bilan')
  getBilan() { return this.accountingService.getBilan(); }

  // ── Paiements ────────────────────────────────────────────────────
  @Get('payments')
  getPayments(@Query('type') type?: string) { return this.accountingService.findPayments(type); }
  @Post('payments/receive')
  receivePayment(@Body() dto: any) { return this.accountingService.receivePayment(dto); }
  @Post('payments/pay-bill')
  payBill(@Body() dto: any) { return this.accountingService.payBill(dto); }

  // ── Exercices ────────────────────────────────────────────────────
  @Get('fiscal-years')
  getFiscalYears() { return this.accountingService.findFiscalYears(); }
  @Post('fiscal-years')
  createFiscalYear(@Body() dto: any) { return this.accountingService.createFiscalYear(dto); }
  @Post('fiscal-years/:id/close')
  closeFiscalYear(@Param('id') id: string) { return this.accountingService.closeFiscalYear(id); }

}
