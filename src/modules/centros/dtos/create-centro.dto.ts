import { IsString, IsOptional, IsEnum } from 'class-validator';

enum TipoCentro {
  SAUDE = 'SAUDE',
  ADMINISTRATIVO = 'ADMINISTRATIVO',
  EDUCACAO = 'EDUCACAO',
  SEGURANCA = 'SEGURANCA',
  OUTRO = 'OUTRO',
}

export class CreateCentroDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsEnum(TipoCentro)
  tipo: TipoCentro;

  @IsString()
  endereco: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  horaAbertura?: string;

  @IsOptional()
  @IsString()
  horaFechamento?: string;

  @IsOptional()
  @IsString()
  diasAtendimento?: string;
}
