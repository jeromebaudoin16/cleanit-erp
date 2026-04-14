import { Controller, Get, Post, Put, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('approvals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('approvals')
export class ApprovalsController {
  constructor(private svc: ApprovalsService) {}
  @Get()              findAll()                                          { return this.svc.findAll(); }
  @Get('stats')       getStats()                                         { return this.svc.getStats(); }
  @Get(':id')         findOne(@Param('id') id: string)                   { return this.svc.findOne(+id); }
  @Post()             create(@Body() body: any)                          { return this.svc.create(body); }
  @Put(':id')         update(@Param('id') id: string, @Body() body: any) { return this.svc.update(+id, body); }
  @Patch(':id/submit')      submit(@Param('id') id: string, @Body() b: any)      { return this.svc.submit(+id, b.submittedBy, b.submittedByEmail); }
  @Patch(':id/review1')     review1(@Param('id') id: string, @Body() b: any)     { return this.svc.review1(+id, b.reviewer, b.reviewerEmail, b.decision, b.comment); }
  @Patch(':id/review2')     review2(@Param('id') id: string, @Body() b: any)     { return this.svc.review2(+id, b.reviewer, b.reviewerEmail, b.decision, b.comment); }
  @Patch(':id/boss-approve') bossApprove(@Param('id') id: string, @Body() b: any) { return this.svc.bossApprove(+id, b.boss, b.decision, b.comment); }
  @Patch(':id/mark-paid')   markPaid(@Param('id') id: string, @Body() b: any)    { return this.svc.markPaid(+id, b.paymentRef, b.paymentMethod); }
}
