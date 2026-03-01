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

export class CreateScheduleDto {
  @IsString({ message: 'ID do centro deve ser texto' })
  @IsUUID('4', { message: 'ID do centro deve ser UUID válido' })
  @IsNotEmpty({ message: 'ID do centro é obrigatório' })
  centerId!: string;

  @IsDateString(
    { strict: true },
    { message: 'Data deve estar em formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)' }
  )
  @IsFutureDate({ minDaysAhead: 1 }, { message: 'Data deve ser no mínimo 1 dia no futuro' })
  @IsValidWeekday({ message: 'Data debe ser em dia útil (segunda a sexta)' })
  @IsNotEmpty({ message: 'Data do agendamento é obrigatória' })
  scheduledDate!: string;

  @IsEnum(TipoBI, { message: 'Tipo de BI inválido' })
  @IsNotEmpty({ message: 'Tipo de BI é obrigatório' })
  tipoBI!: TipoBI;

  @IsOptional()
  @IsInt({ message: 'Número de slot deve ser inteiro' })
  @Min(1, { message: 'Número de slot mínimo é 1' })
  @Max(999, { message: 'Número de slot máximo é 999' })
  slotNumber?: number;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser texto' })
  @MaxLength(500, { message: 'Descrição deve ter máximo 500 caracteres' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Notas deve ser texto' })
  @MaxLength(1000, { message: 'Notas deve ter máximo 1000 caracteres' })
  notes?: string;
}
