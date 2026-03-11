import { Controller, Get, Post, Put, Patch, Param, Body, UseGuards, HttpCode } from '@nestjs/common';
import { TipoServicoService } from './tipo-servico.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('tipos-servico')
export class TipoServicoController {
  constructor(private readonly tipoServicoService: TipoServicoService) {}

  @Get()
  async findAll() {
    return this.tipoServicoService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.tipoServicoService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(201)
  async create(@Body() body: { descricao: string }) {
    return this.tipoServicoService.create(body.descricao);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() body: { descricao: string }) {
    return this.tipoServicoService.update(id, body.descricao);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  async toggleActive(@Param('id') id: string) {
    return this.tipoServicoService.toggleActive(id);
  }
}
