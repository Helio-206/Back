import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { BIScheduleStatus } from '@prisma/client';

export class UpdateScheduleDto {
  @IsOptional()
  @IsString({ message: 'Descrição deve ser texto' })
  @MaxLength(500, { message: 'Descrição deve ter máximo 500 caracteres' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Notas deve ser texto' })
  @MaxLength(1000, { message: 'Notas deve ter máximo 1000 caracteres' })
  notes?: string;

  @IsOptional()
  @IsEnum(BIScheduleStatus, {
    message: 'Status BI inválido',
  })
  biStatus?: BIScheduleStatus;
}
