import { OnModuleInit } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { SitesService } from './sites/sites.service';
export declare class AppModule implements OnModuleInit {
    private usersService;
    private sitesService;
    constructor(usersService: UsersService, sitesService: SitesService);
    onModuleInit(): Promise<void>;
}
