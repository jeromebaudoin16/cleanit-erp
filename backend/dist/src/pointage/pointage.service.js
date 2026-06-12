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
exports.PointageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pointage_entity_1 = require("./pointage.entity");
const ZONES = {
    bureau_principal: { lat: 4.0511, lng: 9.7085, rayon: 200, nom: 'Bureau Principal Douala' },
    'DLA-001': { lat: 4.0511, lng: 9.7085, rayon: 300, nom: 'Site Akwa Douala' },
    'DLA-003': { lat: 4.0667, lng: 9.6500, rayon: 300, nom: 'Site Bonabéri' },
    'YDE-001': { lat: 3.8480, lng: 11.5021, rayon: 300, nom: 'Site Centre Yaoundé' },
    'KRI-001': { lat: 2.9395, lng: 9.9087, rayon: 300, nom: 'Site Kribi Port' },
    'GAR-001': { lat: 9.3019, lng: 13.3920, rayon: 300, nom: 'Site Garoua' },
    'LIM-001': { lat: 4.0167, lng: 9.2000, rayon: 300, nom: 'Site Limbé' },
};
function calculerDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
let PointageService = class PointageService {
    pointageRepo;
    constructor(pointageRepo) {
        this.pointageRepo = pointageRepo;
    }
    async pointer(dto) {
        const pointage = this.pointageRepo.create({
            ...dto,
            type: dto.type,
            typeEmploye: dto.typeEmploye,
            heurePointage: new Date(),
        });
        if (dto.latitude && dto.longitude) {
            const zoneKey = dto.siteCode || 'bureau_principal';
            const zone = ZONES[zoneKey];
            if (zone) {
                const distance = calculerDistance(dto.latitude, dto.longitude, zone.lat, zone.lng);
                pointage.distanceZone = distance;
                pointage.horsZone = distance > zone.rayon;
            }
        }
        return await this.pointageRepo.save(pointage);
    }
    async getPointages(query) {
        const where = {};
        if (query.userId)
            where.userId = query.userId;
        if (query.siteCode)
            where.siteCode = query.siteCode;
        const page = query.page || 1;
        const limit = query.limit || 50;
        const [data, total] = await this.pointageRepo.findAndCount({
            where,
            order: { heurePointage: 'DESC' },
            take: limit,
            skip: (page - 1) * limit,
        });
        return { data, total, page, limit };
    }
    async getPointagesJour(userId, date) {
        const targetDate = date ? new Date(date) : new Date();
        const debut = new Date(targetDate);
        debut.setHours(0, 0, 0, 0);
        const fin = new Date(targetDate);
        fin.setHours(23, 59, 59, 999);
        return await this.pointageRepo.find({
            where: {
                userId,
                heurePointage: (0, typeorm_2.Between)(debut, fin),
            },
            order: { heurePointage: 'ASC' },
        });
    }
    async getStats(dateDebut, dateFin) {
        const debut = dateDebut ? new Date(dateDebut) : new Date(new Date().setDate(1));
        const fin = dateFin ? new Date(dateFin) : new Date();
        const pointages = await this.pointageRepo.find({
            where: { heurePointage: (0, typeorm_2.Between)(debut, fin) },
        });
        const horsZone = pointages.filter(p => p.horsZone).length;
        const parEmploye = {};
        pointages.forEach(p => {
            if (!parEmploye[p.userId]) {
                parEmploye[p.userId] = { nom: p.userName, entrees: 0, sorties: 0, horsZone: 0 };
            }
            if (p.type === pointage_entity_1.TypePointage.ENTREE)
                parEmploye[p.userId].entrees++;
            if (p.type === pointage_entity_1.TypePointage.SORTIE)
                parEmploye[p.userId].sorties++;
            if (p.horsZone)
                parEmploye[p.userId].horsZone++;
        });
        return {
            total: pointages.length,
            horsZone,
            parEmploye: Object.values(parEmploye),
            pointagesRecents: pointages.slice(0, 10),
        };
    }
    async getDernierPointage(userId) {
        return await this.pointageRepo.findOne({
            where: { userId },
            order: { heurePointage: 'DESC' },
        });
    }
    async validerPointage(id, validePar) {
        await this.pointageRepo.update(id, { valide: true, validePar });
        return await this.pointageRepo.findOne({ where: { id } });
    }
    async getPresenceTempsReel() {
        const aujourd = new Date();
        const debut = new Date(aujourd);
        debut.setHours(0, 0, 0, 0);
        const pointages = await this.pointageRepo.find({
            where: { heurePointage: (0, typeorm_2.Between)(debut, aujourd) },
            order: { heurePointage: 'DESC' },
        });
        const presences = {};
        pointages.forEach(p => {
            if (!presences[p.userId]) {
                presences[p.userId] = {
                    userId: p.userId,
                    nom: p.userName,
                    role: p.userRole,
                    derniereAction: p.type,
                    heureAction: p.heurePointage,
                    present: p.type === pointage_entity_1.TypePointage.ENTREE || p.type === pointage_entity_1.TypePointage.PAUSE_FIN,
                    site: p.siteCode,
                    horsZone: p.horsZone,
                };
            }
        });
        return Object.values(presences);
    }
};
exports.PointageService = PointageService;
exports.PointageService = PointageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pointage_entity_1.Pointage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PointageService);
//# sourceMappingURL=pointage.service.js.map