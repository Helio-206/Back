import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  Max,
  Matches,
  IsEmail,
} from 'class-validator';
import { Provincia, CenterType } from '@prisma/client';

/**
 * Create center DTO with validation for institutional scheduling centers
 */
export class CreateCenterDto {
  /**
   * Center name
   */
  @IsString({ message: 'Nome deve ser texto' })
  @MinLength(3, { message: 'Nome deve ter mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter máximo 100 caracteres' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name!: string;

  /**
   * Center description
   */
  @IsOptional()
  @IsString({ message: 'Descrição deve ser texto' })
  @MaxLength(500, { message: 'Descrição deve ter máximo 500 caracteres' })
  description?: string;

  /**
   * Type of center - HEALTH, ADMINISTRATIVE, EDUCATION, SECURITY, OTHER
   */
  @IsEnum(CenterType, { message: 'Tipo de centro inválido' })
  @IsNotEmpty({ message: 'Tipo de centro é obrigatório' })
  type!: CenterType;

  /**
   * Physical address of center
   */
  @IsString({ message: 'Endereço deve ser texto' })
  @MinLength(5, { message: 'Endereço deve ter mínimo 5 caracteres' })
  @MaxLength(255, { message: 'Endereço deve ter máximo 255 caracteres' })
  @IsNotEmpty({ message: 'Endereço é obrigatório' })
  address!: string;

  /**
   * Province where center is located
   */
  @IsEnum(Provincia, { message: 'Província inválida' })
  @IsNotEmpty({ message: 'Província é obrigatória' })
  provincia!: Provincia;

  /**
   * Phone number in international format
   */
  @IsOptional()
  @Matches(/^\+244\d{9}$/, {
    message: 'Telefone deve estar no formato: +244XXXXXXXXX',
  })
  phone?: string;

  /**
   * Email address of center
   */
  @IsOptional()
  @IsEmail({}, { message: 'Email deve ser válido' })
  email?: string;

  /**
   * Center opening time (HH:MM format)
   */
  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d$/, {
    message: 'Horário de abertura deve estar em formato HH:MM',
  })
  openingTime?: string;

  /**
   * Center closing time (HH:MM format)
   */
  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d$/, {
    message: 'Horário de fechamento deve estar em formato HH:MM',
  })
  closingTime?: string;

  /**
   * Days of operation (comma-separated: MONDAY,TUESDAY,etc)
   */
  @IsOptional()
  @IsString({ message: 'Dias de atendimento deve ser texto' })
  attendanceDays?: string;

  /**
   * Daily slot capacity for appointments (1-100)
   */
  @IsOptional()
  @IsInt({ message: 'Capacidade deve ser um número inteiro' })
  @Min(1, { message: 'Capacidade mínima é 1' })
  @Max(100, { message: 'Capacidade máxima é 100' })
  capacidadeAgentos?: number;
}
