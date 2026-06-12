import { Repository } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
export declare class PurchaseOrdersService {
    private repo;
    constructor(repo: Repository<PurchaseOrder>);
    findAll(): Promise<PurchaseOrder[]>;
    findOne(id: number): Promise<PurchaseOrder | null>;
    importPO(file?: Express.Multer.File): Promise<PurchaseOrder>;
    private detectModule;
    private getDefaultItems;
    private generateActions;
    generateTracker(id: number): Promise<Buffer>;
}
