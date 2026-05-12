import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CleanITBooksService } from './cleanitbooks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/cleanitbooks')
@UseGuards(JwtAuthGuard)
export class CleanITBooksController {
  constructor(private readonly svc: CleanITBooksService) {}

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
}

// ── Routes comptables ────────────────────────────────────────────
import { AccountingService } from './accounting.service';

// NOTA: Ces routes sont ajoutées dans le contrôleur existant
// Les méthodes suivantes doivent être ajoutées manuellement
// via le script de patch ci-dessous
