import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private users;
    private jwt;
    constructor(users: UsersService, jwt: JwtService);
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: number;
            email: string;
            firstName: string;
            lastName: string;
            role: import("../users/user.entity").UserRole;
        };
    }>;
    validateUser(payload: any): Promise<import("../users/user.entity").User | null>;
}
