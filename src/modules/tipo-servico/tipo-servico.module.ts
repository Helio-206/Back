import { Module } from '@nestjs/common';
import { TipoServicoService } from './tipo-servico.service';
import { TipoServicoController } from './tipo-servico.controller';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TipoServicoController],
  providers: [TipoServicoService],
})
export class TipoServicoModule {}
