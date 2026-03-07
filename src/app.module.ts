import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@database/database.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { CentersModule } from '@modules/centers/centers.module';
import { SchedulesModule } from '@modules/schedules/schedules.module';
import { TipoServicoModule } from '@modules/tipo-servico/tipo-servico.module';
import { EstadoAgendamentoModule } from '@modules/estado-agendamento/estado-agendamento.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CentersModule,
    SchedulesModule,
    TipoServicoModule,
    EstadoAgendamentoModule,
  ],
})
export class AppModule {}
