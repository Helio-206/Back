import { Controller, Get, Param } from '@nestjs/common';
import { TipoServicoService } from './tipo-servico.service';

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
}
