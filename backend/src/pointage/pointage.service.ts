import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Pointage, TypePointage, TypeEmploye } from './pointage.entity';
import { CreatePointageDto, GetPointagesDto } from './pointage.dto';

// Zones géofencing définies
const ZONES = {
  bureau_principal: { lat: 4.0511, lng: 9.7085, rayon: 200, nom: 'Bureau Principal Douala' },
  'DLA-001': { lat: 4.0511, lng: 9.7085, rayon: 300, nom: 'Site Akwa Douala' },
  'DLA-003': { lat: 4.0667, lng: 9.6500, rayon: 300, nom: 'Site Bonabéri' },
  'YDE-001': { lat: 3.8480, lng: 11.5021, rayon: 300, nom: 'Site Centre Yaoundé' },
  'KRI-001': { lat: 2.9395, lng: 9.9087, rayon: 300, nom: 'Site Kribi Port' },
  'GAR-001': { lat: 9.3019, lng: 13.3920, rayon: 300, nom: 'Site Garoua' },
  'LIM-001': { lat: 4.0167, lng: 9.2000, rayon: 300, nom: 'Site Limbé' },
};

function calculerDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

@Injectable()
export class PointageService {
  constructor(
    @InjectRepository(Pointage)
    private pointageRepo: Repository<Pointage>,
  ) {}

  async pointer(dto: CreatePointageDto) {
    const pointage = this.pointageRepo.create({
      ...dto,
      type: dto.type as TypePointage,
      typeEmploye: dto.typeEmploye as TypeEmploye,
      heurePointage: new Date(),
    });

    // Vérifier géofencing
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

  async getPointages(query: GetPointagesDto) {
    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.siteCode) where.siteCode = query.siteCode;

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

  async getPointagesJour(userId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const debut = new Date(targetDate);
    debut.setHours(0, 0, 0, 0);
    const fin = new Date(targetDate);
    fin.setHours(23, 59, 59, 999);

    return await this.pointageRepo.find({
      where: {
        userId,
        heurePointage: Between(debut, fin),
      },
      order: { heurePointage: 'ASC' },
    });
  }

  async getStats(dateDebut?: string, dateFin?: string) {
    const debut = dateDebut ? new Date(dateDebut) : new Date(new Date().setDate(1));
    const fin = dateFin ? new Date(dateFin) : new Date();

    const pointages = await this.pointageRepo.find({
      where: { heurePointage: Between(debut, fin) },
    });

    const horsZone = pointages.filter(p => p.horsZone).length;
    const parEmploye = {};
    pointages.forEach(p => {
      if (!parEmploye[p.userId]) {
        parEmploye[p.userId] = { nom: p.userName, entrees: 0, sorties: 0, horsZone: 0 };
      }
      if (p.type === TypePointage.ENTREE) parEmploye[p.userId].entrees++;
      if (p.type === TypePointage.SORTIE) parEmploye[p.userId].sorties++;
      if (p.horsZone) parEmploye[p.userId].horsZone++;
    });

    return {
      total: pointages.length,
      horsZone,
      parEmploye: Object.values(parEmploye),
      pointagesRecents: pointages.slice(0, 10),
    };
  }

  async getDernierPointage(userId: string) {
    return await this.pointageRepo.findOne({
      where: { userId },
      order: { heurePointage: 'DESC' },
    });
  }

  async validerPointage(id: string, validePar: string) {
    await this.pointageRepo.update(id, { valide: true, validePar });
    return await this.pointageRepo.findOne({ where: { id } });
  }

  async getPresenceTempsReel() {
    const aujourd = new Date();
    const debut = new Date(aujourd);
    debut.setHours(0, 0, 0, 0);

    const pointages = await this.pointageRepo.find({
      where: { heurePointage: Between(debut, aujourd) },
      order: { heurePointage: 'DESC' },
    });

    // Dernier pointage par employé
    const presences = {};
    pointages.forEach(p => {
      if (!presences[p.userId]) {
        presences[p.userId] = {
          userId: p.userId,
          nom: p.userName,
          role: p.userRole,
          derniereAction: p.type,
          heureAction: p.heurePointage,
          present: p.type === TypePointage.ENTREE || p.type === TypePointage.PAUSE_FIN,
          site: p.siteCode,
          horsZone: p.horsZone,
        };
      }
    });

    return Object.values(presences);
  }
}
