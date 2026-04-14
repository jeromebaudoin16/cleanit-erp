import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mediation } from './mediation.entity';

@Injectable()
export class MediationService {
  constructor(@InjectRepository(Mediation) private repo: Repository<Mediation>) {}
  findAll() { return this.repo.find({ order: { createdAt: 'DESC' } }); }
  findOne(id: number) { return this.repo.findOne({ where: { id } }); }
  create(data: any) { return this.repo.save(this.repo.create(data)); }
  async update(id: number, data: any) { await this.repo.update(id, data); return this.findOne(id); }
  remove(id: number) { return this.repo.delete(id); }
}
