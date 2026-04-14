import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InterventionsService } from './interventions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('interventions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('interventions')
export class InterventionsController {
  constructor(private svc: InterventionsService) {}
  @Get()        findAll()                          { return this.svc.findAll(); }
  @Get(':id')   findOne(@Param('id') id: string)   { return this.svc.findOne(+id); }
  @Post()       create(@Body() body: any)          { return this.svc.create(body); }
  @Put(':id')   update(@Param('id') id: string, @Body() body: any) { return this.svc.update(+id, body); }
  @Delete(':id') remove(@Param('id') id: string)  { return this.svc.remove(+id); }
}
