import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { DatabaseModule } from '@database/database.module';
import { ScheduleAccessGuard } from '@common/guards/schedule-access.guard';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { ActivityLogModule } from '@modules/activity-log/activity-log.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
    }),
    NotificationsModule,
    ActivityLogModule,
  ],
  providers: [SchedulesService, ScheduleAccessGuard],
  controllers: [SchedulesController],
  exports: [SchedulesService],
})
export class SchedulesModule {}
