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
exports.TrackingController = void 0;
const common_1 = require("@nestjs/common");
const tracking_service_1 = require("./tracking.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TrackingController = class TrackingController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    getDashboard() { return this.svc.getDashboardStats(); }
    getLatest() { return this.svc.getLatestPositions(); }
    getPos(id, from, to) { return this.svc.getPositionsUser(id, +from || Date.now() - 86400000, +to || Date.now()); }
    getPointages() { return this.svc.getPointages(); }
    createPointage(dto) { return this.svc.createPointage(dto); }
    validate(id, b) { return this.svc.validatePointage(id, b.managerId, b.statut); }
    getShifts() { return this.svc.getAllShifts(); }
    getByTech(id) { return this.svc.getShiftsByTech(id); }
    getByJob(id) { return this.svc.getShiftsByJob(id); }
    createShift(dto) { return this.svc.createShift(dto); }
    updateShift(id, dto) { return this.svc.updateShift(id, dto); }
    complete(id, b) { return this.svc.completeShift(id, b.rapport); }
    validateShift(id) { return this.svc.validateShift(id); }
    getAlerts(s) { return this.svc.getAlerts(s); }
    getOpen() { return this.svc.getOpenAlerts(); }
    ack(id, b) { return this.svc.acknowledgeAlert(id, b.by); }
    resolve(id) { return this.svc.resolveAlert(id); }
};
exports.TrackingController = TrackingController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('positions/latest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getLatest", null);
__decorate([
    (0, common_1.Get)('positions/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getPos", null);
__decorate([
    (0, common_1.Get)('pointages'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getPointages", null);
__decorate([
    (0, common_1.Post)('pointages'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "createPointage", null);
__decorate([
    (0, common_1.Put)('pointages/:id/validate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "validate", null);
__decorate([
    (0, common_1.Get)('shifts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getShifts", null);
__decorate([
    (0, common_1.Get)('shifts/tech/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getByTech", null);
__decorate([
    (0, common_1.Get)('shifts/job/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getByJob", null);
__decorate([
    (0, common_1.Post)('shifts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "createShift", null);
__decorate([
    (0, common_1.Put)('shifts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "updateShift", null);
__decorate([
    (0, common_1.Put)('shifts/:id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "complete", null);
__decorate([
    (0, common_1.Put)('shifts/:id/validate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "validateShift", null);
__decorate([
    (0, common_1.Get)('alerts'),
    __param(0, (0, common_1.Query)('statut')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Get)('alerts/open'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getOpen", null);
__decorate([
    (0, common_1.Put)('alerts/:id/acknowledge'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "ack", null);
__decorate([
    (0, common_1.Put)('alerts/:id/resolve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "resolve", null);
exports.TrackingController = TrackingController = __decorate([
    (0, common_1.Controller)('api/tracking'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tracking_service_1.TrackingService])
], TrackingController);
//# sourceMappingURL=tracking.controller.js.map