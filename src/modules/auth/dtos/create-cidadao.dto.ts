import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEmail,
  IsEnum,
  IsDecimal,
  Matches,
  MinLength,
} from 'class-validator';
import { Provincia } from '@prisma/client';
import { HasMinimumAge, IsNotFutureDate } from '../../../common/validators';

export class CreateCidadaoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nome!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  sobrenome!: string;

  @IsDateString()
  @IsNotEmpty()
  @IsNotFutureDate()
  @HasMinimumAge(1)
  dataNascimento!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(M|F|Outro)$/, {
    message: 'sexo must be M, F, or Outro',
  })
  sexo!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsEnum(Provincia)
  @IsNotEmpty()
  provinciaResidencia!: Provincia;

  @IsOptional()
  @IsString()
  municipioResidencia?: string;

  @IsOptional()
  @IsString()
  bairroResidencia?: string;

  @IsOptional()
  @IsString()
  ruaResidencia?: string;

  @IsOptional()
  @IsString()
  numeroCasa?: string;

  @IsOptional()
  @IsEnum(Provincia)
  provinciaNascimento?: Provincia;

  @IsOptional()
  @IsString()
  municipioNascimento?: string;

  @IsOptional()
  @IsString()
  estadoCivil?: string;

  @IsOptional()
  @IsString()
  nomePai?: string;

  @IsOptional()
  @IsString()
  sobrenomePai?: string;

  @IsOptional()
  @IsString()
  nomeMae?: string;

  @IsOptional()
  @IsString()
  sobrenomeMae?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  altura?: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{9}[A-Z]{2}\d{3,4}$/, {
    message: 'numeroBIAnterior deve ter o formato: 9 dígitos + 2 letras + 3-4 dígitos (ex: 007654844BO042)',
  })
  numeroBIAnterior?: string;
}
