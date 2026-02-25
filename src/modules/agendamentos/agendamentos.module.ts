import { Module } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { AgendamentosController } from './agendamentos.controller';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [AgendamentosService],
  controllers: [AgendamentosController],
  exports: [AgendamentosService],
})
export class AgendamentosModule {}
