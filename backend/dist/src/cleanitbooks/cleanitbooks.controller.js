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
exports.CleanITBooksController = void 0;
const common_1 = require("@nestjs/common");
const cleanitbooks_service_1 = require("./cleanitbooks.service");
const accounting_service_1 = require("./accounting.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CleanITBooksController = class CleanITBooksController {
    svc;
    accountingService;
    constructor(svc, accountingService) {
        this.svc = svc;
        this.accountingService = accountingService;
    }
    getDashboard() { return this.svc.getDashboardKpis(); }
    getCustomers() { return this.svc.findAllCustomers(); }
    getCustomer(id) { return this.svc.findCustomer(id); }
    createCustomer(dto) { return this.svc.createCustomer(dto); }
    updateCustomer(id, dto) { return this.svc.updateCustomer(id, dto); }
    deleteCustomer(id) { return this.svc.deleteCustomer(id); }
    getVendors() { return this.svc.findAllVendors(); }
    getVendor(id) { return this.svc.findVendor(id); }
    createVendor(dto) { return this.svc.createVendor(dto); }
    updateVendor(id, dto) { return this.svc.updateVendor(id, dto); }
    deleteVendor(id) { return this.svc.deleteVendor(id); }
    getJobs() { return this.svc.findAllJobs(); }
    getJob(id) { return this.svc.findJob(id); }
    createJob(dto) { return this.svc.createJob(dto); }
    updateJob(id, dto) { return this.svc.updateJob(id, dto); }
    deleteJob(id) { return this.svc.deleteJob(id); }
    getInvoices() { return this.svc.findAllInvoices(); }
    getInvoice(id) { return this.svc.findInvoice(id); }
    getInvByCustomer(id) { return this.svc.findInvoicesByCustomer(id); }
    getInvByJob(id) { return this.svc.findInvoicesByJob(id); }
    createInvoice(dto) { return this.svc.createInvoice(dto); }
    updateInvoice(id, dto) { return this.svc.updateInvoice(id, dto); }
    getBills() { return this.svc.findAllBills(); }
    getBill(id) { return this.svc.findBill(id); }
    getBillsByVendor(id) { return this.svc.findBillsByVendor(id); }
    getBillsByJob(id) { return this.svc.findBillsByJob(id); }
    createBill(dto) { return this.svc.createBill(dto); }
    updateBill(id, dto) { return this.svc.updateBill(id, dto); }
    getTime() { return this.svc.findAllTimeEntries(); }
    getTimeByJob(id) { return this.svc.findTimeByJob(id); }
    getTimeByEmp(id) { return this.svc.findTimeByEmp(id); }
    createTime(dto) { return this.svc.createTimeEntry(dto); }
    deleteTime(id) { return this.svc.deleteTimeEntry(id); }
    getAccounts(classe) {
        if (classe)
            return this.accountingService.findAccountsByClasse(classe);
        return this.accountingService.findAllAccounts();
    }
    initPlanComptable() { return this.accountingService.initPlanComptable(); }
    getJournal(type) { return this.accountingService.findJournal(type); }
    getGrandLivre(account) { return this.accountingService.getGrandLivre(account); }
    getBalance() { return this.accountingService.getBalance(); }
    getPL() { return this.accountingService.getPL(); }
    getBilan() { return this.accountingService.getBilan(); }
    getPayments(type) { return this.accountingService.findPayments(type); }
    receivePayment(dto) { return this.accountingService.receivePayment(dto); }
    payBill(dto) { return this.accountingService.payBill(dto); }
    getFiscalYears() { return this.accountingService.findFiscalYears(); }
    createFiscalYear(dto) { return this.accountingService.createFiscalYear(dto); }
    closeFiscalYear(id) { return this.accountingService.closeFiscalYear(id); }
};
exports.CleanITBooksController = CleanITBooksController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('customers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getCustomers", null);
__decorate([
    (0, common_1.Get)('customers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getCustomer", null);
__decorate([
    (0, common_1.Post)('customers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "createCustomer", null);
__decorate([
    (0, common_1.Put)('customers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "updateCustomer", null);
__decorate([
    (0, common_1.Delete)('customers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "deleteCustomer", null);
__decorate([
    (0, common_1.Get)('vendors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getVendors", null);
__decorate([
    (0, common_1.Get)('vendors/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getVendor", null);
__decorate([
    (0, common_1.Post)('vendors'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "createVendor", null);
__decorate([
    (0, common_1.Put)('vendors/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "updateVendor", null);
__decorate([
    (0, common_1.Delete)('vendors/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "deleteVendor", null);
__decorate([
    (0, common_1.Get)('jobs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getJobs", null);
__decorate([
    (0, common_1.Get)('jobs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getJob", null);
__decorate([
    (0, common_1.Post)('jobs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "createJob", null);
__decorate([
    (0, common_1.Put)('jobs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "updateJob", null);
__decorate([
    (0, common_1.Delete)('jobs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "deleteJob", null);
__decorate([
    (0, common_1.Get)('invoices'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Get)('invoices/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Get)('invoices/customer/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getInvByCustomer", null);
__decorate([
    (0, common_1.Get)('invoices/job/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getInvByJob", null);
__decorate([
    (0, common_1.Post)('invoices'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Put)('invoices/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "updateInvoice", null);
__decorate([
    (0, common_1.Get)('bills'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getBills", null);
__decorate([
    (0, common_1.Get)('bills/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getBill", null);
__decorate([
    (0, common_1.Get)('bills/vendor/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getBillsByVendor", null);
__decorate([
    (0, common_1.Get)('bills/job/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getBillsByJob", null);
__decorate([
    (0, common_1.Post)('bills'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "createBill", null);
__decorate([
    (0, common_1.Put)('bills/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "updateBill", null);
__decorate([
    (0, common_1.Get)('time'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getTime", null);
__decorate([
    (0, common_1.Get)('time/job/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getTimeByJob", null);
__decorate([
    (0, common_1.Get)('time/emp/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getTimeByEmp", null);
__decorate([
    (0, common_1.Post)('time'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "createTime", null);
__decorate([
    (0, common_1.Delete)('time/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "deleteTime", null);
__decorate([
    (0, common_1.Get)('accounts'),
    __param(0, (0, common_1.Query)('classe')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getAccounts", null);
__decorate([
    (0, common_1.Post)('accounts/init'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "initPlanComptable", null);
__decorate([
    (0, common_1.Get)('journal'),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getJournal", null);
__decorate([
    (0, common_1.Get)('grandlivre'),
    __param(0, (0, common_1.Query)('account')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getGrandLivre", null);
__decorate([
    (0, common_1.Get)('balance'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('pl'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getPL", null);
__decorate([
    (0, common_1.Get)('bilan'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getBilan", null);
__decorate([
    (0, common_1.Get)('payments'),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Post)('payments/receive'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "receivePayment", null);
__decorate([
    (0, common_1.Post)('payments/pay-bill'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "payBill", null);
__decorate([
    (0, common_1.Get)('fiscal-years'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "getFiscalYears", null);
__decorate([
    (0, common_1.Post)('fiscal-years'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "createFiscalYear", null);
__decorate([
    (0, common_1.Post)('fiscal-years/:id/close'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CleanITBooksController.prototype, "closeFiscalYear", null);
exports.CleanITBooksController = CleanITBooksController = __decorate([
    (0, common_1.Controller)('api/cleanitbooks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cleanitbooks_service_1.CleanITBooksService, accounting_service_1.AccountingService])
], CleanITBooksController);
//# sourceMappingURL=cleanitbooks.controller.js.map