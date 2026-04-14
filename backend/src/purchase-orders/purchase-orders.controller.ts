import { Controller, Get, Post, Param, UseGuards, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { PurchaseOrdersService } from './purchase-orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('purchase-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private svc: PurchaseOrdersService) {}

  @Get()
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(+id); }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importPO(@UploadedFile() file: Express.Multer.File) {
    return this.svc.importPO(file);
  }

  @Get(':id/tracker')
  async downloadTracker(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.svc.generateTracker(+id);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="tracker-po-${id}-cleanit.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
