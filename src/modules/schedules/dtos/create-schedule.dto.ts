import {
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNotEmpty,
  Min,
  Max,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { TipoBI } from '@prisma/client';
import { IsFutureDate, IsValidWeekday } from '@common/validators';

/**
 * Create schedule DTO for BI (Bilhete de Identidade) appointment scheduling
 * Enforces business rules for center availability and future date requirements
 */
export class CreateScheduleDto {
  /**
   * Center ID where appointment will be scheduled
   */
  @IsString({ message: 'ID do centro deve ser texto' })
  @IsUUID('4', { message: 'ID do centro deve ser UUID válido' })
  @IsNotEmpty({ message: 'ID do centro é obrigatório' })
  centerId!: string;

  /**
   * Scheduled appointment date - must be future date and valid weekday
   */
  @IsDateString(
    { strict: true },
    { message: 'Data deve estar em formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)' }
  )
  @IsFutureDate({ minDaysAhead: 1 }, { message: 'Data deve ser no mínimo 1 dia no futuro' })
  @IsValidWeekday({ message: 'Data debe ser em dia útil (segunda a sexta)' })
  @IsNotEmpty({ message: 'Data do agendamento é obrigatória' })
  scheduledDate!: string;

  /**
   * Type of BI request: NOVO, RENOVACAO, PERDA, EXTRAVIO, ATUALIZACAO_DADOS
   */
  @IsEnum(TipoBI, { message: 'Tipo de BI inválido' })
  @IsNotEmpty({ message: 'Tipo de BI é obrigatório' })
  tipoBI!: TipoBI;

  /**
   * Slot number (optional, auto-assigned if not provided)
   */
  @IsOptional()
  @IsInt({ message: 'Número de slot deve ser inteiro' })
  @Min(1, { message: 'Número de slot mínimo é 1' })
  @Max(999, { message: 'Número de slot máximo é 999' })
  slotNumber?: number;

  /**
   * Brief description of appointment purpose
   */
  @IsOptional()
  @IsString({ message: 'Descrição deve ser texto' })
  @MaxLength(500, { message: 'Descrição deve ter máximo 500 caracteres' })
  description?: string;

  /**
   * Additional notes (visible to staff only)
   */
  @IsOptional()
  @IsString({ message: 'Notas deve ser texto' })
  @MaxLength(1000, { message: 'Notas deve ter máximo 1000 caracteres' })
  notes?: string;
}
