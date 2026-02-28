import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsDateString,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  name!: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{9}LA\d{3}$/, {
    message: 'numeroBIAnterior deve seguir o formato #########LA### (ex.: 123456789LA123)',
  })
  numeroBIAnterior?: string;

  @IsOptional()
  @IsDateString()
  dataNascimento?: string;

  @IsOptional()
  @IsString()
  provinciaNascimento?: string;

  @IsOptional()
  @IsString()
  provinciaResidencia?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  filiacao?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(M|F|Outro)$/, {
    message: 'genero deve ser M, F ou Outro',
  })
  genero?: string;
}
