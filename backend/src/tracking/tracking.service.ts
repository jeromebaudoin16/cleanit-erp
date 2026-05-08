import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingPosition } from './tracking.entity';
import { Pointage } from './pointage.entity';
import { Shift } from './shift.entity';
import { Alerte } from './alert.entity';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(TrackingPosition) private posRepo: Repository<TrackingPosition>,
    @InjectRepository(Pointage) private pointageRepo: Repository<Pointage>,
    @InjectRepository(Shift) private shiftRepo: Repository<Shift>,
    @InjectRepository(Alerte) private alertRepo: Repository<Alerte>,
  ){}

  getPositionsUser(userId:string,from:number,to:number){
    return this.posRepo.createQueryBuilder('p').where('p.userId = :userId AND p.timestamp BETWEEN :from AND :to',{userId,from,to}).orderBy('p.timestamp','ASC').getMany();
  }
  getLatestPositions(){ return this.posRepo.query('SELECT DISTINCT ON ("userId") * FROM tracking_positions ORDER BY "userId", timestamp DESC'); }

  getPointages(){ return this.pointageRepo.find({order:{createdAt:'DESC'}}); }
  createPointage(dto:Partial<Pointage>){ return this.pointageRepo.save({...dto,timestamp:Date.now()}); }
  validatePointage(id:string,managerId:string,statut:'validated'|'rejected'){ return this.pointageRepo.update(id,{statut,validatedBy:managerId,validatedAt:new Date()}); }

  getAllShifts(){ return this.shiftRepo.find({order:{dateDebut:'DESC'}}); }
  getShiftsByTech(technicienId:string){ return this.shiftRepo.findBy({technicienId}); }
  getShiftsByJob(jobId:string){ return this.shiftRepo.findBy({jobId}); }
  createShift(dto:Partial<Shift>){ return this.shiftRepo.save(dto); }
  updateShift(id:string,dto:Partial<Shift>){ return this.shiftRepo.update(id,dto); }
  completeShift(id:string,rapport:string){ return this.shiftRepo.update(id,{statut:'completed',rapportTechnicien:rapport,completedAt:new Date()}); }
  validateShift(id:string){ return this.shiftRepo.update(id,{statut:'validated'}); }

  getAlerts(statut?:string){ return this.alertRepo.find({where:statut?{statut}:{},order:{createdAt:'DESC'}}); }
  getOpenAlerts(){ return this.alertRepo.findBy({statut:'open'}); }
  acknowledgeAlert(id:string,by:string){ return this.alertRepo.update(id,{statut:'acknowledged',acknowledgedBy:by}); }
  resolveAlert(id:string){ return this.alertRepo.update(id,{statut:'resolved',resolvedAt:new Date()}); }

  async getDashboardStats(){
    const [totalPointages,openAlerts,shifts]=await Promise.all([this.pointageRepo.count(),this.alertRepo.countBy({statut:'open'}),this.shiftRepo.find()]);
    return {totalPointages,openAlerts,shiftsAssigned:shifts.filter(s=>s.statut==='assigned').length,shiftsInProgress:shifts.filter(s=>s.statut==='in_progress').length,shiftsCompleted:shifts.filter(s=>s.statut==='completed').length,shiftsValidated:shifts.filter(s=>s.statut==='validated').length};
  }
}
