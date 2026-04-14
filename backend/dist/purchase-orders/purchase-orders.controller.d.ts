import type { Response } from 'express';
import { PurchaseOrdersService } from './purchase-orders.service';
export declare class PurchaseOrdersController {
    private svc;
    constructor(svc: PurchaseOrdersService);
    findAll(): Promise<import("./purchase-order.entity").PurchaseOrder[]>;
    findOne(id: string): Promise<import("./purchase-order.entity").PurchaseOrder | null>;
    importPO(file: Express.Multer.File): Promise<import("./purchase-order.entity").PurchaseOrder>;
    downloadTracker(id: string, res: Response): Promise<void>;
}
