import { UsersService } from './users.service';
export declare class UsersController {
    private svc;
    constructor(svc: UsersService);
    findAll(): Promise<import("./user.entity").User[]>;
    findOne(id: string): Promise<import("./user.entity").User | null>;
    create(body: any): Promise<import("./user.entity").User>;
    update(id: string, body: any): Promise<import("./user.entity").User | null>;
}
