import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';
import { CreateCidadaoDto } from './create-cidadao.dto';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ValidateNested()
  @Type(() => CreateCidadaoDto)
  @IsNotEmpty()
  cidadao!: CreateCidadaoDto;
}
