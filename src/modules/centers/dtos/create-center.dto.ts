import { IsString, IsOptional, IsEnum } from 'class-validator';

enum CenterType {
  HEALTH = 'HEALTH',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  EDUCATION = 'EDUCATION',
  SECURITY = 'SECURITY',
  OTHER = 'OTHER',
}

export class CreateCenterDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CenterType)
  type!: CenterType;

  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  openingTime?: string;

  @IsOptional()
  @IsString()
  closingTime?: string;

  @IsOptional()
  @IsString()
  attendanceDays?: string;
}
