import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/tracking')
@UseGuards(JwtAuthGuard)
export class TrackingController {
  constructor(private svc:TrackingService){}
  @Get('dashboard') getDashboard(){ return this.svc.getDashboardStats(); }
  @Get('positions/latest') getLatest(){ return this.svc.getLatestPositions(); }
  @Get('positions/:userId') getPos(@Param('userId') id:string,@Query('from') from:string,@Query('to') to:string){ return this.svc.getPositionsUser(id,+from||Date.now()-86400000,+to||Date.now()); }
  @Get('pointages') getPointages(){ return this.svc.getPointages(); }
  @Post('pointages') createPointage(@Body() dto:any){ return this.svc.createPointage(dto); }
  @Put('pointages/:id/validate') validate(@Param('id') id:string,@Body() b:any){ return this.svc.validatePointage(id,b.managerId,b.statut); }
  @Get('shifts') getShifts(){ return this.svc.getAllShifts(); }
  @Get('shifts/tech/:id') getByTech(@Param('id') id:string){ return this.svc.getShiftsByTech(id); }
  @Get('shifts/job/:id') getByJob(@Param('id') id:string){ return this.svc.getShiftsByJob(id); }
  @Post('shifts') createShift(@Body() dto:any){ return this.svc.createShift(dto); }
  @Put('shifts/:id') updateShift(@Param('id') id:string,@Body() dto:any){ return this.svc.updateShift(id,dto); }
  @Put('shifts/:id/complete') complete(@Param('id') id:string,@Body() b:any){ return this.svc.completeShift(id,b.rapport); }
  @Put('shifts/:id/validate') validateShift(@Param('id') id:string){ return this.svc.validateShift(id); }
  @Get('alerts') getAlerts(@Query('statut') s:string){ return this.svc.getAlerts(s); }
  @Get('alerts/open') getOpen(){ return this.svc.getOpenAlerts(); }
  @Put('alerts/:id/acknowledge') ack(@Param('id') id:string,@Body() b:any){ return this.svc.acknowledgeAlert(id,b.by); }
  @Put('alerts/:id/resolve') resolve(@Param('id') id:string){ return this.svc.resolveAlert(id); }
}
