import { Module } from '@nestjs/common';
import { ProtocoloService } from './protocolo.service';

@Module({
  providers: [ProtocoloService],
  exports: [ProtocoloService],
})
export class ProtocoloModule {}
