import { AuthService } from './auth.service';
export declare class AuthController {
    private svc;
    constructor(svc: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        token: string;
        user: {
            id: number;
            email: string;
            firstName: string;
            lastName: string;
            role: import("../users/user.entity").UserRole;
        };
    }>;
    me(req: any): any;
}
