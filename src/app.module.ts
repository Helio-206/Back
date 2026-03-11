import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@database/database.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { CentersModule } from '@modules/centers/centers.module';
import { SchedulesModule } from '@modules/schedules/schedules.module';
import { TipoServicoModule } from '@modules/tipo-servico/tipo-servico.module';
import { EstadoAgendamentoModule } from '@modules/estado-agendamento/estado-agendamento.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { ActivityLogModule } from '@modules/activity-log/activity-log.module';

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
    NotificationsModule,
    ActivityLogModule,
  ],
})
export class AppModule {}
