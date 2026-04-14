"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContratsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const contrat_entity_1 = require("./contrat.entity");
const contrats_service_1 = require("./contrats.service");
const contrats_controller_1 = require("./contrats.controller");
let ContratsModule = class ContratsModule {
};
exports.ContratsModule = ContratsModule;
exports.ContratsModule = ContratsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([contrat_entity_1.Contrats])],
        providers: [contrats_service_1.ContratsService],
        controllers: [contrats_controller_1.ContratsController],
        exports: [contrats_service_1.ContratsService],
    })
], ContratsModule);
//# sourceMappingURL=contrats.module.js.map