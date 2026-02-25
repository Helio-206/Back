import { Module } from '@nestjs/common';
import { CentersService } from './centers.service';
import { CentersController } from './centers.controller';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [CentersService],
  controllers: [CentersController],
  exports: [CentersService],
})
export class CentersModule {}
