"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanITBooksModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cleanitbooks_controller_1 = require("./cleanitbooks.controller");
const cleanitbooks_service_1 = require("./cleanitbooks.service");
const accounting_service_1 = require("./accounting.service");
const customer_entity_1 = require("./customer.entity");
const vendor_entity_1 = require("./vendor.entity");
const job_entity_1 = require("./job.entity");
const invoice_entity_1 = require("./invoice.entity");
const bill_entity_1 = require("./bill.entity");
const timeentry_entity_1 = require("./timeentry.entity");
const account_entity_1 = require("./account.entity");
const journal_entry_entity_1 = require("./journal_entry.entity");
const journal_line_entity_1 = require("./journal_line.entity");
const payment_entity_1 = require("./payment.entity");
const fiscal_year_entity_1 = require("./fiscal_year.entity");
let CleanITBooksModule = class CleanITBooksModule {
};
exports.CleanITBooksModule = CleanITBooksModule;
exports.CleanITBooksModule = CleanITBooksModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([
                customer_entity_1.Customer, vendor_entity_1.Vendor, job_entity_1.Job, invoice_entity_1.Invoice, bill_entity_1.Bill, timeentry_entity_1.TimeEntry,
                account_entity_1.Account, journal_entry_entity_1.JournalEntry, journal_line_entity_1.JournalLine, payment_entity_1.Payment, fiscal_year_entity_1.FiscalYear,
            ])],
        controllers: [cleanitbooks_controller_1.CleanITBooksController],
        providers: [cleanitbooks_service_1.CleanITBooksService, accounting_service_1.AccountingService],
        exports: [cleanitbooks_service_1.CleanITBooksService, accounting_service_1.AccountingService],
    })
], CleanITBooksModule);
//# sourceMappingURL=cleanitbooks.module.js.map