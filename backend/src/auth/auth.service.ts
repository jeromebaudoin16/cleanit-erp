import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      token: this.jwt.sign(payload),
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    };
  }

  async register(data: { email: string; password: string; firstName: string; lastName: string; role?: string }) {
    const exists = await this.users.findByEmail(data.email);
    if (exists) throw new UnauthorizedException('Email deja utilise');
    const user = await this.users.create({
      ...data,
      role: (data.role as any) || 'bureau',
      isActive: false, // En attente approbation admin
    });
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      token: this.jwt.sign(payload),
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: user.isActive },
      message: 'Compte cree. En attente de validation par ladmin.',
    };
  }
  async validateUser(payload: any) { return this.users.findOne(payload.sub); }
}
