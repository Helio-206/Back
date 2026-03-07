import { Controller, Get, Param } from '@nestjs/common';
import { EstadoAgendamentoService } from './estado-agendamento.service';

@Controller('estados-agendamento')
export class EstadoAgendamentoController {
  constructor(private readonly estadoAgendamentoService: EstadoAgendamentoService) {}

  @Get()
  async findAll() {
    return this.estadoAgendamentoService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.estadoAgendamentoService.findById(id);
  }
}
