import { Module } from '@nestjs/common';
import { CentersService } from './centros.service';
import { CentersController } from './centros.controller';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [CentersService],
  controllers: [CentersController],
  exports: [CentersService],
})
export class CentersModule {}
