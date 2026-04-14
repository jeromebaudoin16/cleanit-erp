import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evidence } from './evidence.entity';

@Injectable()
export class EvidenceService {
  constructor(@InjectRepository(Evidence) private repo: Repository<Evidence>) {}
  findAll() { return this.repo.find({ order: { createdAt: 'DESC' } }); }
  findOne(id: number) { return this.repo.findOne({ where: { id } }); }
  create(data: any) { return this.repo.save(this.repo.create(data)); }
  async update(id: number, data: any) { await this.repo.update(id, data); return this.findOne(id); }
  remove(id: number) { return this.repo.delete(id); }
}
