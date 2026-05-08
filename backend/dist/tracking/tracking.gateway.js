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
exports.TrackingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tracking_entity_1 = require("./tracking.entity");
const alert_entity_1 = require("./alert.entity");
const ZONES = {
    bureau_dla: { lat: 4.0511, lng: 9.7085, rayon: 150, nom: 'Bureau Douala' },
    bureau_yde: { lat: 3.8667, lng: 11.5167, rayon: 150, nom: 'Bureau Yaoundé' },
    'DLA-001': { lat: 4.0511, lng: 9.7085, rayon: 300, nom: 'Site Akwa Douala' },
    'DLA-002': { lat: 4.0612, lng: 9.7234, rayon: 300, nom: 'Site Bonaberi' },
    'YDE-001': { lat: 3.8480, lng: 11.5021, rayon: 300, nom: 'Site Yaoundé' },
    'KRI-001': { lat: 2.9395, lng: 9.9087, rayon: 300, nom: 'Site Kribi' },
    'GAR-001': { lat: 9.3019, lng: 13.3920, rayon: 300, nom: 'Site Garoua' },
    'LIM-001': { lat: 4.0167, lng: 9.2000, rayon: 300, nom: 'Site Limbé' },
};
function calcDist(a, b, c, d) {
    const R = 6371000, dL = (c - a) * Math.PI / 180, dl = (d - b) * Math.PI / 180;
    const x = Math.sin(dL / 2) ** 2 + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(dl / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
let TrackingGateway = class TrackingGateway {
    posRepo;
    alertRepo;
    server;
    connectedUsers = new Map();
    constructor(posRepo, alertRepo) {
        this.posRepo = posRepo;
        this.alertRepo = alertRepo;
    }
    handleConnection(client) { console.log(`[WS] Connect: ${client.id}`); }
    handleDisconnect(client) {
        for (const [key, user] of this.connectedUsers.entries()) {
            if (user.socketId === client.id) {
                this.connectedUsers.delete(key);
                this.server.emit('user_offline', { userId: user.userId });
                break;
            }
        }
    }
    handleRegister(data, client) {
        this.connectedUsers.set(data.userId, { socketId: client.id, userId: data.userId, userName: data.userName, userType: data.userType, lastPos: null });
        this.server.emit('user_online', { userId: data.userId, userName: data.userName });
        client.emit('registered', { success: true, count: this.connectedUsers.size });
    }
    async handlePosition(data) {
        const zone = ZONES[data.zoneCode];
        let horsZone = false, distanceZone = 0;
        if (zone) {
            distanceZone = calcDist(data.lat, data.lng, zone.lat, zone.lng);
            horsZone = distanceZone > zone.rayon;
        }
        const pos = await this.posRepo.save({ ...data, horsZone, distanceZone: Math.round(distanceZone), timestamp: Date.now() });
        const user = this.connectedUsers.get(data.userId);
        if (user)
            user.lastPos = { lat: data.lat, lng: data.lng, horsZone, distanceZone };
        this.server.emit('position_update', { userId: data.userId, userName: data.userName, userType: data.userType, lat: data.lat, lng: data.lng, accuracy: data.accuracy, speed: data.speed, zoneCode: data.zoneCode, horsZone, distanceZone: Math.round(distanceZone), batteryLevel: data.batteryLevel, networkType: data.networkType, timestamp: Date.now() });
        if (horsZone) {
            const alerte = await this.alertRepo.save({ type: 'hors_zone', userId: data.userId, userName: data.userName, zoneCode: data.zoneCode, message: `${data.userName} est à ${Math.round(distanceZone)}m du périmètre de ${zone?.nom}`, severite: distanceZone > 1000 ? 'critical' : 'high', statut: 'open', metadata: { lat: data.lat, lng: data.lng, distanceZone } });
            this.server.emit('new_alert', alerte);
        }
        return pos;
    }
    handleGetPositions() {
        return Array.from(this.connectedUsers.values()).filter(u => u.lastPos).map(u => ({ userId: u.userId, userName: u.userName, userType: u.userType, ...u.lastPos }));
    }
    async handleAck(data) {
        await this.alertRepo.update(data.alertId, { statut: 'acknowledged', acknowledgedBy: data.managerId });
        this.server.emit('alert_updated', { alertId: data.alertId, statut: 'acknowledged' });
    }
};
exports.TrackingGateway = TrackingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], TrackingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('register'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleRegister", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('position_update'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrackingGateway.prototype, "handlePosition", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_live_positions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleGetPositions", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('acknowledge_alert'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrackingGateway.prototype, "handleAck", null);
exports.TrackingGateway = TrackingGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' }, namespace: '/tracking' }),
    __param(0, (0, typeorm_1.InjectRepository)(tracking_entity_1.TrackingPosition)),
    __param(1, (0, typeorm_1.InjectRepository)(alert_entity_1.Alerte)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TrackingGateway);
//# sourceMappingURL=tracking.gateway.js.map