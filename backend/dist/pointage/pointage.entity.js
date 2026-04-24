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
exports.Pointage = exports.TypeEmploye = exports.TypePointage = void 0;
const typeorm_1 = require("typeorm");
var TypePointage;
(function (TypePointage) {
    TypePointage["ENTREE"] = "entree";
    TypePointage["SORTIE"] = "sortie";
    TypePointage["PAUSE_DEBUT"] = "pause_debut";
    TypePointage["PAUSE_FIN"] = "pause_fin";
})(TypePointage || (exports.TypePointage = TypePointage = {}));
var TypeEmploye;
(function (TypeEmploye) {
    TypeEmploye["INTERNE"] = "interne";
    TypeEmploye["EXTERNE"] = "externe";
})(TypeEmploye || (exports.TypeEmploye = TypeEmploye = {}));
let Pointage = class Pointage {
    id;
    userId;
    userName;
    userRole;
    type;
    typeEmploye;
    latitude;
    longitude;
    adresse;
    siteCode;
    siteName;
    photoUrl;
    horsZone;
    distanceZone;
    notes;
    deviceInfo;
    valide;
    validePar;
    createdAt;
    heurePointage;
};
exports.Pointage = Pointage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Pointage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Pointage.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Pointage.prototype, "userName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Pointage.prototype, "userRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TypePointage }),
    __metadata("design:type", String)
], Pointage.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TypeEmploye, default: TypeEmploye.INTERNE }),
    __metadata("design:type", String)
], Pointage.prototype, "typeEmploye", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], Pointage.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], Pointage.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pointage.prototype, "adresse", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pointage.prototype, "siteCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pointage.prototype, "siteName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pointage.prototype, "photoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Pointage.prototype, "horsZone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Pointage.prototype, "distanceZone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pointage.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pointage.prototype, "deviceInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Pointage.prototype, "valide", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pointage.prototype, "validePar", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Pointage.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Pointage.prototype, "heurePointage", void 0);
exports.Pointage = Pointage = __decorate([
    (0, typeorm_1.Entity)('pointages')
], Pointage);
//# sourceMappingURL=pointage.entity.js.map