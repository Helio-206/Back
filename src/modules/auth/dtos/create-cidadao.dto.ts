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
  dataNascimento!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(M|F|Outro)$/, {
    message: 'sexo deve ser M, F ou Outro',
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
  @Matches(/^\d{9}LA\d{3}$/, {
    message: 'numeroBIAnterior deve seguir o formato #########LA### (ex.: 123456789LA123)',
  })
  numeroBIAnterior?: string;
}
