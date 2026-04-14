import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private repo: Repository<Notification>) {}
  findAll() { return this.repo.find({ order: { createdAt: 'DESC' }, take: 20 }); }
  findByUser(userId: number) { return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 20 }); }
  create(data: Partial<Notification>) { return this.repo.save(this.repo.create(data)); }
  markRead(id: number) { return this.repo.update(id, { read: true }); }
}
