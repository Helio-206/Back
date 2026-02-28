import { IsString, IsDateString, IsOptional, IsEnum, IsInt } from 'class-validator';

enum ScheduleStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateScheduleDto {
  @IsDateString()
  scheduledDate!: string;

  @IsString()
  centerId!: string;

  @IsOptional()
  @IsInt()
  slotNumber?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;
}
