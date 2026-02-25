import { IsString, IsDateString, IsOptional, IsEnum, IsInt } from 'class-validator';

enum AgendamentoStatus {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  EM_PROGRESSO = 'EM_PROGRESSO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
}

export class CreateAgendamentoDto {
  @IsDateString()
  dataAgendamento: string;

  @IsString()
  centroId: string;

  @IsOptional()
  @IsInt()
  numeroVaga?: number;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsEnum(AgendamentoStatus)
  status?: AgendamentoStatus;
}
