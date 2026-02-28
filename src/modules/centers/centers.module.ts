import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CentersService } from './centers.service';
import { CentersController } from './centers.controller';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
    }),
  ],
  providers: [CentersService],
  controllers: [CentersController],
  exports: [CentersService],
})
export class CentersModule {}
