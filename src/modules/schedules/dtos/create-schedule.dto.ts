import { IsString, IsDateString, IsOptional, IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';
import { IsFutureDate } from '../../../common/validators';

enum ScheduleStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateScheduleDto {
  @IsDateString()
  @IsNotEmpty()
  @IsFutureDate({
    message: 'Data do agendamento deve ser no futuro',
  })
  scheduledDate!: string;

  @IsString()
  @IsNotEmpty()
  @IsString()
  centerId!: string;

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

  @IsOptional()
  @IsEnum(ScheduleStatus, {
    message: 'status deve ser um dos valores válidos: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED',
  })
  status?: ScheduleStatus;
}
