import { OnModuleInit } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { SitesService } from './sites/sites.service';
import { ApprovalsService } from './approvals/approvals.service';
export declare class AppModule implements OnModuleInit {
    private usersService;
    private sitesService;
    private approvalsService;
    constructor(usersService: UsersService, sitesService: SitesService, approvalsService: ApprovalsService);
    onModuleInit(): Promise<void>;
}
