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
    message: 'Schedule date must be in the future',
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
  @Min(1, { message: 'slotNumber must be greater than 0' })
  slotNumber?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
