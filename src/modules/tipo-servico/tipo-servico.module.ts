import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TipoServicoService } from './tipo-servico.service';
import { TipoServicoController } from './tipo-servico.controller';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
    }),
  ],
  controllers: [TipoServicoController],
  providers: [TipoServicoService],
})
export class TipoServicoModule {}
