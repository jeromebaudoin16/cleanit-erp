"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanITBooksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("./customer.entity");
const vendor_entity_1 = require("./vendor.entity");
const job_entity_1 = require("./job.entity");
const invoice_entity_1 = require("./invoice.entity");
const bill_entity_1 = require("./bill.entity");
const timeentry_entity_1 = require("./timeentry.entity");
const accounting_service_1 = require("./accounting.service");
let CleanITBooksService = class CleanITBooksService {
    customerRepo;
    vendorRepo;
    jobRepo;
    invoiceRepo;
    billRepo;
    timeRepo;
    accounting;
    constructor(customerRepo, vendorRepo, jobRepo, invoiceRepo, billRepo, timeRepo, accounting) {
        this.customerRepo = customerRepo;
        this.vendorRepo = vendorRepo;
        this.jobRepo = jobRepo;
        this.invoiceRepo = invoiceRepo;
        this.billRepo = billRepo;
        this.timeRepo = timeRepo;
        this.accounting = accounting;
    }
    findAllCustomers() { return this.customerRepo.find(); }
    findCustomer(id) { return this.customerRepo.findOneBy({ id }); }
    createCustomer(dto) { return this.customerRepo.save(dto); }
    updateCustomer(id, dto) { return this.customerRepo.update(id, dto); }
    deleteCustomer(id) { return this.customerRepo.delete(id); }
    findAllVendors() { return this.vendorRepo.find(); }
    findVendor(id) { return this.vendorRepo.findOneBy({ id }); }
    createVendor(dto) { return this.vendorRepo.save(dto); }
    updateVendor(id, dto) { return this.vendorRepo.update(id, dto); }
    deleteVendor(id) { return this.vendorRepo.delete(id); }
    findAllJobs() { return this.jobRepo.find({ order: { createdAt: "DESC" } }); }
    findJob(id) { return this.jobRepo.findOneBy({ id }); }
    createJob(dto) { return this.jobRepo.save(dto); }
    updateJob(id, dto) { return this.jobRepo.update(id, dto); }
    deleteJob(id) { return this.jobRepo.delete(id); }
    findAllInvoices() { return this.invoiceRepo.find({ order: { createdAt: "DESC" } }); }
    findInvoicesByCustomer(customerId) { return this.invoiceRepo.findBy({ customerId }); }
    findInvoicesByJob(jobId) { return this.invoiceRepo.findBy({ jobId }); }
    findInvoice(id) { return this.invoiceRepo.findOneBy({ id }); }
    async createInvoice(dto) {
        const invoice = await this.invoiceRepo.save({
            ...dto,
            status: dto.status || "Draft",
            balance: dto.total,
            amountPaid: 0,
        });
        try {
            await this.accounting.generateInvoiceEntry(invoice);
        }
        catch (e) {
            console.warn("Accounting skip:", e.message);
        }
        return invoice;
    }
    async updateInvoice(id, dto) { return this.invoiceRepo.update(id, dto); }
    findAllBills() { return this.billRepo.find({ order: { createdAt: "DESC" } }); }
    findBillsByVendor(vendorId) { return this.billRepo.findBy({ vendorId }); }
    findBillsByJob(jobId) { return this.billRepo.findBy({ jobId }); }
    findBill(id) { return this.billRepo.findOneBy({ id }); }
    async createBill(dto) {
        const bill = await this.billRepo.save({
            ...dto,
            status: dto.status || "Draft",
            balance: dto.total,
            amountPaid: 0,
        });
        try {
            await this.accounting.generateBillEntry(bill);
        }
        catch (e) {
            console.warn("Accounting skip:", e.message);
        }
        return bill;
    }
    async updateBill(id, dto) { return this.billRepo.update(id, dto); }
    findAllTimeEntries() { return this.timeRepo.find({ order: { createdAt: "DESC" } }); }
    findTimeByJob(jobId) { return this.timeRepo.findBy({ jobId }); }
    findTimeByEmp(empId) { return this.timeRepo.findBy({ empId }); }
    createTimeEntry(dto) { return this.timeRepo.save(dto); }
    deleteTimeEntry(id) { return this.timeRepo.delete(id); }
    async getDashboardKpis() {
        const [jobs, invoices, bills, customers, vendors] = await Promise.all([
            this.jobRepo.find(),
            this.invoiceRepo.find(),
            this.billRepo.find(),
            this.customerRepo.find(),
            this.vendorRepo.find(),
        ]);
        const totalCA = invoices.reduce((s, i) => s + Number(i.total), 0);
        const totalAR = invoices.reduce((s, i) => s + Number(i.balance), 0);
        const totalAP = bills.reduce((s, b) => s + Number(b.balance), 0);
        const totalContrats = jobs.reduce((s, j) => s + Number(j.contractAmount), 0);
        return {
            totalCA, totalAR, totalAP, totalContrats,
            jobsCount: jobs.length,
            jobsInProgress: jobs.filter(j => j.statut === "In Progress").length,
            customersCount: customers.length,
            vendorsCount: vendors.length,
            invoicesCount: invoices.length,
            overdueInvoices: invoices.filter(i => i.status === "Overdue").length,
        };
    }
};
exports.CleanITBooksService = CleanITBooksService;
exports.CleanITBooksService = CleanITBooksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(1, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __param(2, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(3, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(4, (0, typeorm_1.InjectRepository)(bill_entity_1.Bill)),
    __param(5, (0, typeorm_1.InjectRepository)(timeentry_entity_1.TimeEntry)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        accounting_service_1.AccountingService])
], CleanITBooksService);
//# sourceMappingURL=cleanitbooks.service.js.map