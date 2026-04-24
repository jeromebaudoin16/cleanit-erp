"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPointagesDto = exports.CreatePointageDto = void 0;
class CreatePointageDto {
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
    notes;
    deviceInfo;
}
exports.CreatePointageDto = CreatePointageDto;
class GetPointagesDto {
    userId;
    dateDebut;
    dateFin;
    type;
    siteCode;
    page;
    limit;
}
exports.GetPointagesDto = GetPointagesDto;
//# sourceMappingURL=pointage.dto.js.map