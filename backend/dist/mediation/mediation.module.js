"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const mediation_entity_1 = require("./mediation.entity");
const mediation_service_1 = require("./mediation.service");
const mediation_controller_1 = require("./mediation.controller");
let MediationModule = class MediationModule {
};
exports.MediationModule = MediationModule;
exports.MediationModule = MediationModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([mediation_entity_1.Mediation])],
        providers: [mediation_service_1.MediationService],
        controllers: [mediation_controller_1.MediationController],
        exports: [mediation_service_1.MediationService],
    })
], MediationModule);
//# sourceMappingURL=mediation.module.js.map