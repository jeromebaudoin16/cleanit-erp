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
exports.PointageController = void 0;
const common_1 = require("@nestjs/common");
const pointage_service_1 = require("./pointage.service");
const pointage_dto_1 = require("./pointage.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PointageController = class PointageController {
    pointageService;
    constructor(pointageService) {
        this.pointageService = pointageService;
    }
    async pointer(dto) {
        return await this.pointageService.pointer(dto);
    }
    async getPointages(query) {
        return await this.pointageService.getPointages(query);
    }
    async getStats(dateDebut, dateFin) {
        return await this.pointageService.getStats(dateDebut, dateFin);
    }
    async getPresenceTempsReel() {
        return await this.pointageService.getPresenceTempsReel();
    }
    async getPointagesJour(userId, date) {
        return await this.pointageService.getPointagesJour(userId, date);
    }
    async getDernierPointage(userId) {
        return await this.pointageService.getDernierPointage(userId);
    }
    async valider(id, validePar) {
        return await this.pointageService.validerPointage(id, validePar);
    }
};
exports.PointageController = PointageController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pointage_dto_1.CreatePointageDto]),
    __metadata("design:returntype", Promise)
], PointageController.prototype, "pointer", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pointage_dto_1.GetPointagesDto]),
    __metadata("design:returntype", Promise)
], PointageController.prototype, "getPointages", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('dateDebut')),
    __param(1, (0, common_1.Query)('dateFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PointageController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('presence-temps-reel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PointageController.prototype, "getPresenceTempsReel", null);
__decorate([
    (0, common_1.Get)('jour/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PointageController.prototype, "getPointagesJour", null);
__decorate([
    (0, common_1.Get)('dernier/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PointageController.prototype, "getDernierPointage", null);
__decorate([
    (0, common_1.Patch)('valider/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('validePar')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PointageController.prototype, "valider", null);
exports.PointageController = PointageController = __decorate([
    (0, common_1.Controller)('pointage'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [pointage_service_1.PointageService])
], PointageController);
//# sourceMappingURL=pointage.controller.js.map