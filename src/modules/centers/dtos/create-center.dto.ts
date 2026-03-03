import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  Matches,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { CenterType, Provincia } from '@prisma/client';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new Center
 * Validates all fields including hours format (HH:MM), attendance days (MONDAY,TUESDAY,etc)
 */
export class CreateCenterDto {
  @IsNotEmpty({ message: 'Center name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @IsNotEmpty({ message: 'Center type is required' })
  @IsEnum(CenterType, {
    message: `Type must be one of: ${Object.values(CenterType).join(', ')}`,
  })
  type!: CenterType;

  @IsNotEmpty({ message: 'Address is required' })
  @IsString({ message: 'Address must be a string' })
  @MinLength(5, { message: 'Address must be at least 5 characters long' })
  @MaxLength(200, { message: 'Address must not exceed 200 characters' })
  address!: string;

  @IsNotEmpty({ message: 'Province is required' })
  @IsEnum(Provincia, {
    message: `Province must be one of: ${Object.values(Provincia).join(', ')}`,
  })
  provincia!: Provincia;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^(\+244)?9\d{8}$/, {
    message: 'Phone must be a valid Angolan number (9XXXXXXXX or +2449XXXXXXXX)',
  })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Opening time must be a string' })
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Opening time must be in HH:MM format (00:00 to 23:59)',
  })
  openingTime?: string;

  @IsOptional()
  @IsString({ message: 'Closing time must be a string' })
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Closing time must be in HH:MM format (00:00 to 23:59)',
  })
  closingTime?: string;

  @IsOptional()
  @IsString({ message: 'Attendance days must be a string' })
  @Matches(
    /^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)(,(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY))*$/,
    {
      message:
        'Attendance days must be comma-separated day names: MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY',
    }
  )
  attendanceDays?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Agent capacity must be an integer' })
  @Min(1, { message: 'Agent capacity must be at least 1' })
  @Max(100, { message: 'Agent capacity must not exceed 100' })
  capacidadeAgentos?: number;
}
