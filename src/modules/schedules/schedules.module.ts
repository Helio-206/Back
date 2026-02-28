import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
    }),
  ],
  providers: [SchedulesService],
  controllers: [SchedulesController],
  exports: [SchedulesService],
})
export class SchedulesModule {}
