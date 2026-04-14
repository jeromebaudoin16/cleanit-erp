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
exports.CrmService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crm_entity_1 = require("./crm.entity");
let CrmService = class CrmService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    findAll() { return this.repo.find({ order: { createdAt: 'DESC' } }); }
    findOne(id) { return this.repo.findOne({ where: { id } }); }
    create(data) { return this.repo.save(this.repo.create(data)); }
    async update(id, data) { await this.repo.update(id, data); return this.findOne(id); }
    remove(id) { return this.repo.delete(id); }
};
exports.CrmService = CrmService;
exports.CrmService = CrmService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(crm_entity_1.Crm)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CrmService);
//# sourceMappingURL=crm.service.js.map