import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  HttpCode,
  Query,
} from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dtos/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dtos/update-agendamento.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('agendamentos')
export class AgendamentosController {
  constructor(private agendamentosService: AgendamentosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createAgendamentoDto: CreateAgendamentoDto,
    @CurrentUser() user,
  ) {
    return this.agendamentosService.create(user.id, createAgendamentoDto);
  }

  @Get()
  async findAll(@Query('centroId') centroId?: string) {
    if (centroId) {
      return this.agendamentosService.findByCentro(centroId);
    }
    return this.agendamentosService.findAll();
  }

  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  async findMyAgendamentos(@CurrentUser() user) {
    return this.agendamentosService.findByUser(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.agendamentosService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateAgendamentoDto: UpdateAgendamentoDto,
  ) {
    return this.agendamentosService.update(id, updateAgendamentoDto);
  }

  @Delete(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async cancel(@Param('id') id: string) {
    return this.agendamentosService.cancel(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    return this.agendamentosService.delete(id);
  }
}
