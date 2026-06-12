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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiscalYear = void 0;
const typeorm_1 = require("typeorm");
let FiscalYear = class FiscalYear {
    id;
    nom;
    dateDebut;
    dateFin;
    statut;
    cloture;
    createdAt;
};
exports.FiscalYear = FiscalYear;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FiscalYear.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FiscalYear.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FiscalYear.prototype, "dateDebut", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FiscalYear.prototype, "dateFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'open' }),
    __metadata("design:type", String)
], FiscalYear.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], FiscalYear.prototype, "cloture", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FiscalYear.prototype, "createdAt", void 0);
exports.FiscalYear = FiscalYear = __decorate([
    (0, typeorm_1.Entity)('cib_fiscal_years')
], FiscalYear);
//# sourceMappingURL=fiscal_year.entity.js.map