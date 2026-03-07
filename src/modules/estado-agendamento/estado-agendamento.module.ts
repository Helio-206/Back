import { Module } from '@nestjs/common';
import { EstadoAgendamentoService } from './estado-agendamento.service';
import { EstadoAgendamentoController } from './estado-agendamento.controller';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EstadoAgendamentoController],
  providers: [EstadoAgendamentoService],
})
export class EstadoAgendamentoModule {}
