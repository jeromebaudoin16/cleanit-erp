import { Controller, Post, Get, Patch, Body, Query, Param, UseGuards } from '@nestjs/common';
import { PointageService } from './pointage.service';
import { CreatePointageDto, GetPointagesDto } from './pointage.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pointage')
@UseGuards(JwtAuthGuard)
export class PointageController {
  constructor(private readonly pointageService: PointageService) {}

  @Post()
  async pointer(@Body() dto: CreatePointageDto) {
    return await this.pointageService.pointer(dto);
  }

  @Get()
  async getPointages(@Query() query: GetPointagesDto) {
    return await this.pointageService.getPointages(query);
  }

  @Get('stats')
  async getStats(@Query('dateDebut') dateDebut?: string, @Query('dateFin') dateFin?: string) {
    return await this.pointageService.getStats(dateDebut, dateFin);
  }

  @Get('presence-temps-reel')
  async getPresenceTempsReel() {
    return await this.pointageService.getPresenceTempsReel();
  }

  @Get('jour/:userId')
  async getPointagesJour(@Param('userId') userId: string, @Query('date') date?: string) {
    return await this.pointageService.getPointagesJour(userId, date);
  }

  @Get('dernier/:userId')
  async getDernierPointage(@Param('userId') userId: string) {
    return await this.pointageService.getDernierPointage(userId);
  }

  @Patch('valider/:id')
  async valider(@Param('id') id: string, @Body('validePar') validePar: string) {
    return await this.pointageService.validerPointage(id, validePar);
  }
}
