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
exports.TrackingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tracking_entity_1 = require("./tracking.entity");
const pointage_entity_1 = require("./pointage.entity");
const shift_entity_1 = require("./shift.entity");
const alert_entity_1 = require("./alert.entity");
let TrackingService = class TrackingService {
    posRepo;
    pointageRepo;
    shiftRepo;
    alertRepo;
    constructor(posRepo, pointageRepo, shiftRepo, alertRepo) {
        this.posRepo = posRepo;
        this.pointageRepo = pointageRepo;
        this.shiftRepo = shiftRepo;
        this.alertRepo = alertRepo;
    }
    getPositionsUser(userId, from, to) {
        return this.posRepo.createQueryBuilder('p').where('p.userId = :userId AND p.timestamp BETWEEN :from AND :to', { userId, from, to }).orderBy('p.timestamp', 'ASC').getMany();
    }
    getLatestPositions() { return this.posRepo.query('SELECT DISTINCT ON ("userId") * FROM tracking_positions ORDER BY "userId", timestamp DESC'); }
    getPointages() { return this.pointageRepo.find({ order: { createdAt: 'DESC' } }); }
    createPointage(dto) { return this.pointageRepo.save({ ...dto, timestamp: Date.now() }); }
    validatePointage(id, managerId, statut) { return this.pointageRepo.update(id, { statut, validatedBy: managerId, validatedAt: new Date() }); }
    getAllShifts() { return this.shiftRepo.find({ order: { dateDebut: 'DESC' } }); }
    getShiftsByTech(technicienId) { return this.shiftRepo.findBy({ technicienId }); }
    getShiftsByJob(jobId) { return this.shiftRepo.findBy({ jobId }); }
    createShift(dto) { return this.shiftRepo.save(dto); }
    updateShift(id, dto) { return this.shiftRepo.update(id, dto); }
    completeShift(id, rapport) { return this.shiftRepo.update(id, { statut: 'completed', rapportTechnicien: rapport, completedAt: new Date() }); }
    validateShift(id) { return this.shiftRepo.update(id, { statut: 'validated' }); }
    getAlerts(statut) { return this.alertRepo.find({ where: statut ? { statut } : {}, order: { createdAt: 'DESC' } }); }
    getOpenAlerts() { return this.alertRepo.findBy({ statut: 'open' }); }
    acknowledgeAlert(id, by) { return this.alertRepo.update(id, { statut: 'acknowledged', acknowledgedBy: by }); }
    resolveAlert(id) { return this.alertRepo.update(id, { statut: 'resolved', resolvedAt: new Date() }); }
    async getDashboardStats() {
        const [totalPointages, openAlerts, shifts] = await Promise.all([this.pointageRepo.count(), this.alertRepo.countBy({ statut: 'open' }), this.shiftRepo.find()]);
        return { totalPointages, openAlerts, shiftsAssigned: shifts.filter(s => s.statut === 'assigned').length, shiftsInProgress: shifts.filter(s => s.statut === 'in_progress').length, shiftsCompleted: shifts.filter(s => s.statut === 'completed').length, shiftsValidated: shifts.filter(s => s.statut === 'validated').length };
    }
};
exports.TrackingService = TrackingService;
exports.TrackingService = TrackingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tracking_entity_1.TrackingPosition)),
    __param(1, (0, typeorm_1.InjectRepository)(pointage_entity_1.Pointage)),
    __param(2, (0, typeorm_1.InjectRepository)(shift_entity_1.Shift)),
    __param(3, (0, typeorm_1.InjectRepository)(alert_entity_1.Alerte)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TrackingService);
//# sourceMappingURL=tracking.service.js.map