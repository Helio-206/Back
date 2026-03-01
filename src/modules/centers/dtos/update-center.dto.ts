import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
  Matches,
  IsEmail,
} from 'class-validator';

export class UpdateCenterDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser texto' })
  @MaxLength(100, { message: 'Nome deve ter máximo 100 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser texto' })
  @MaxLength(500, { message: 'Descrição deve ter máximo 500 caracteres' })
  description?: string;

  @IsOptional()
  @Matches(/^\+244\d{9}$/, {
    message: 'Telefone deve estar no formato: +244XXXXXXXXX',
  })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email deve ser válido' })
  email?: string;

  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d$/, {
    message: 'Horário de abertura deve estar em formato HH:MM',
  })
  openingTime?: string;

  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d$/, {
    message: 'Horário de fechamento deve estar em formato HH:MM',
  })
  closingTime?: string;

  @IsOptional()
  @IsString({ message: 'Dias de atendimento deve ser texto' })
  attendanceDays?: string;

  @IsOptional()
  @IsInt({ message: 'Capacidade deve ser um número inteiro' })
  @Min(1, { message: 'Capacidade mínima é 1' })
  @Max(100, { message: 'Capacidade máxima é 100' })
  capacidadeAgentos?: number;
}
