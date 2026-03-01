import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { BIScheduleStatus } from '@prisma/client';

/**
 * Update schedule DTO for rescheduling or updating appointment details
 * Only certain fields can be updated after creation
 */
export class UpdateScheduleDto {
  /**
   * Updated appointment description
   */
  @IsOptional()
  @IsString({ message: 'Descrição deve ser texto' })
  @MaxLength(500, { message: 'Descrição deve ter máximo 500 caracteres' })
  description?: string;

  /**
   * Updated notes (staff only)
   */
  @IsOptional()
  @IsString({ message: 'Notas deve ser texto' })
  @MaxLength(1000, { message: 'Notas deve ter máximo 1000 caracteres' })
  notes?: string;

  /**
   * Updated BI schedule status (ADMIN/CENTER only)
   * Tracks progress: AGENDADO → CONFIRMADO → BIOMETRIA_RECOLHIDA → EM_PROCESSAMENTO → PRONTO_RETIRADA
   */
  @IsOptional()
  @IsEnum(BIScheduleStatus, {
    message: 'Status BI inválido',
  })
  biStatus?: BIScheduleStatus;
}
