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
    register(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role?: string;
    }): Promise<{
        token: string;
        user: {
            id: number;
            email: string;
            firstName: string;
            lastName: string;
            role: import("../users/user.entity").UserRole;
            isActive: boolean;
        };
        message: string;
    }>;
    validateUser(payload: any): Promise<import("../users/user.entity").User | null>;
}
