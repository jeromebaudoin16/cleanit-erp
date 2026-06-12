"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RhModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const rh_entity_1 = require("./rh.entity");
const rh_service_1 = require("./rh.service");
const rh_controller_1 = require("./rh.controller");
let RhModule = class RhModule {
};
exports.RhModule = RhModule;
exports.RhModule = RhModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([rh_entity_1.Rh])],
        providers: [rh_service_1.RhService],
        controllers: [rh_controller_1.RhController],
        exports: [rh_service_1.RhService],
    })
], RhModule);
//# sourceMappingURL=rh.module.js.map