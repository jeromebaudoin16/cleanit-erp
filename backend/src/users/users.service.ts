import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findAll() {
    return this.repo.find({ select: ['id','email','firstName','lastName','role','phone','isActive','createdAt','latitude','longitude'] });
  }
  findOne(id: number) { return this.repo.findOne({ where: { id } }); }
  findByEmail(email: string) { return this.repo.findOne({ where: { email } }); }

  async create(data: Partial<User>) {
    const u = this.repo.create({ ...data, password: await bcrypt.hash(data.password || 'Pass123!', 10) });
    return this.repo.save(u);
  }

  async update(id: number, data: Partial<User>) {
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async updateLocation(id: number, lat: number, lon: number) {
    await this.repo.update(id, { latitude: lat, longitude: lon, lastSeen: new Date() });
  }

  async seedAdmin() {
    const exists = await this.findByEmail('admin@cleanit.cm');
    if (!exists) {
      await this.create({ email: 'admin@cleanit.cm', password: 'Admin123!', firstName: 'Admin', lastName: 'CleanIT', role: UserRole.ADMIN });
      await this.create({ email: 'pm@cleanit.cm', password: 'PM123!', firstName: 'Marie', lastName: 'Kamga', role: UserRole.PROJECT_MANAGER });
      await this.create({ email: 'tech@cleanit.cm', password: 'Tech123!', firstName: 'Thomas', lastName: 'Ngono', role: UserRole.TECHNICIAN });
      await this.create({ email: 'jerome@cleanit.cm', password: 'Jerome123!', firstName: 'Jérôme', lastName: 'Bell', role: UserRole.ADMIN });
      await this.create({ email: 'finance@cleanit.cm', password: 'Finance123!', firstName: 'Alice', lastName: 'Finance', role: UserRole.FINANCE });
      await this.create({ email: 'hr@cleanit.cm', password: 'HR123!', firstName: 'Clara', lastName: 'RH', role: UserRole.HR });
      await this.create({ email: 'chef@cleanit.cm', password: 'Chef123!', firstName: 'Pierre', lastName: 'Etoga', role: UserRole.PROJECT_MANAGER });
      await this.create({ email: 'terrain@cleanit.cm', password: 'Terrain123!', firstName: 'Thomas', lastName: 'Ngono', role: UserRole.TECHNICIAN });
      console.log('✅ Comptes créés: admin | jerome | finance | hr | chef | terrain | pm | tech');
    }
  }
}
