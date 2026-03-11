import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  sobrenome?: string;

  @IsOptional()
  @IsString()
  sexo?: string;

  @IsOptional()
  @IsString()
  provinciaResidencia?: string;

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
  @IsString()
  estadoCivil?: string;
}
