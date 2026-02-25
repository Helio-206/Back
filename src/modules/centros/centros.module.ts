import { Module } from '@nestjs/common';
import { CentrosService } from './centros.service';
import { CentrosController } from './centros.controller';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [CentrosService],
  controllers: [CentrosController],
  exports: [CentrosService],
})
export class CentrosModule {}
