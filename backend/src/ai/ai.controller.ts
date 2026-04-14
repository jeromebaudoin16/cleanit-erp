import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private svc: AiService) {}
  @Get()        findAll()                          { return this.svc.findAll(); }
  @Get(':id')   findOne(@Param('id') id: string)   { return this.svc.findOne(+id); }
  @Post()       create(@Body() body: any)          { return this.svc.create(body); }
  @Put(':id')   update(@Param('id') id: string, @Body() body: any) { return this.svc.update(+id, body); }
  @Delete(':id') remove(@Param('id') id: string)  { return this.svc.remove(+id); }
}
