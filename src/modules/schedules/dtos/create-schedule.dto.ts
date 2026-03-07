import {
  IsString,
  IsDateString,
  IsOptional,
  IsInt,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { IsFutureDate } from '../../../common/validators';

export class CreateScheduleDto {
  @IsDateString()
  @IsNotEmpty()
  @IsFutureDate({
    message: 'Data do agendamento deve ser no futuro',
  })
  scheduledDate!: string;

  @IsString()
  @IsNotEmpty()
  centerId!: string;

  @IsOptional()
  @IsString()
  tipoServicoId?: string;

  @IsString()
  @IsNotEmpty()
  estadoAgendamentoId!: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'slotNumber deve ser maior que 0' })
  slotNumber?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
