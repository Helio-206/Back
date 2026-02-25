# Regras de Negócio - Agendamentos

## Overview

Este documento descreve todas as regras de negócio implementadas para o módulo de Agendamentos.

## Regras Funcionais

### RN-001: Data de Agendamento Futura
**Descrição**: Cidadãos podem agendar apenas com datas futuras.

**Implementação**:
```typescript
// Em CreateAgendamentoDto
@IsDateString()
dataAgendamento: string; // Validado em service

// Em AgendamentosService.create()
const scheduledDate = new Date(createDto.dataAgendamento);
if (scheduledDate <= new Date()) {
  throw new BadRequestException('Data deve ser no futuro');
}
```

**Exceção**: ADMIN pode agendar retroativamente (futuro).

### RN-002: Não Duplicar Agendamento Mesmo Centro/Data
**Descrição**: Cidadão não pode ter 2+ agendamentos no mesmo centro na mesma data.

**Implementação**:
```typescript
async create(userId: string, createDto: CreateAgendamentoDto) {
  const existing = await this.prisma.agendamento.findFirst({
    where: {
      userId,
      centroId: createDto.centroId,
      dataAgendamento: createDto.dataAgendamento,
      status: { in: ['PENDENTE', 'CONFIRMADO'] }, // Ignore cancelados
    },
  });
  
  if (existing) {
    throw new ConflictException(
      'Já tem agendamento neste centro nesta data',
    );
  }
  
  return this.prisma.agendamento.create({...});
}
```

### RN-003: Ciclo de Vida de Agendamento
**Descrição**: Estados válidos e transições permitidas.

**Estados**:
- `PENDENTE`: Criado, aguardando confirmação
- `CONFIRMADO`: Centro confirmou
- `EM_PROGRESSO`: Cidadão compareceu, serviço em execução
- `CONCLUIDO`: Serviço finalizado
- `CANCELADO`: Cancelado por cidadão ou centro

**Transições Válidas**:
```
PENDENTE ──→ CONFIRMADO ──→ EM_PROGRESSO ──→ CONCLUIDO
   ↓            ↓              ↓                ↓
   └──→ CANCELADO ←──────────────────────────┘
```

**Regra**: Uma vez `CONCLUIDO`, não pode mudar (imutável).

**Implementação**:
```typescript
async update(id: string, updateDto: UpdateAgendamentoDto) {
  const current = await this.prisma.agendamento.findUnique({
    where: { id },
  });
  
  if (current.status === 'CONCLUIDO') {
    throw new BadRequestException('Agendamento concluído é imutável');
  }
  
  // Validar transição de estado
  const validTransitions = {
    PENDENTE: ['CONFIRMADO', 'CANCELADO'],
    CONFIRMADO: ['EM_PROGRESSO', 'CANCELADO'],
    EM_PROGRESSO: ['CONCLUIDO', 'CANCELADO'],
    CONCLUIDO: [],
    CANCELADO: [],
  };
  
  const allowed = validTransitions[current.status];
  if (!allowed.includes(updateDto.status)) {
    throw new BadRequestException(
      `Não pode mudar de ${current.status} para ${updateDto.status}`,
    );
  }
  
  return this.prisma.agendamento.update({...});
}
```

### RN-004: Cancelamento de Agendamento
**Descrição**: Agendamentos podem ser cancelados antes de conclusão.

**Quem pode cancelar**:
- Cidadão pode cancelar seu próprio agendamento
- Centro pode cancelar (rejeição)
- ADMIN pode cancelar qualquer

**Validação**:
- Só é possível cancelar se status ≠ CONCLUIDO
- Observações são opcionais

**Implementação**:
```typescript
async cancel(id: string, userId: string, userRole: Role) {
  const agendamento = await this.findOne(id);
  
  // Verificar permissão
  if (userRole === 'CIDADAO' && agendamento.userId !== userId) {
    throw new ForbiddenException('Só pode cancelar seu agendamento');
  }
  
  if (agendamento.status === 'CONCLUIDO') {
    throw new BadRequestException('Não pode cancelar concluído');
  }
  
  return this.prisma.agendamento.update({
    where: { id },
    data: { status: 'CANCELADO' },
  });
}
```

### RN-005: Visualização de Agendamentos
**Descrição**: Cada role vê apenas os agendamentos permitidos.

**CIDADAO**:
- Ver apenas seus próprios agendamentos
- Endpoint: `GET /agendamentos/user/me`

**CENTRO**:
- Ver agendamentos do seu centro
- Endpoint: `GET /agendamentos?centroId=xyz`

**ADMIN**:
- Ver todos os agendamentos
- Endpoint: `GET /agendamentos`

**Implementação**:
```typescript
async findAll(userId: string, userRole: Role, centroFilter?: string) {
  const where: any = {};
  
  if (userRole === 'CIDADAO') {
    where.userId = userId;
  } else if (userRole === 'CENTRO') {
    const centro = await this.prisma.centro.findUnique({
      where: { userId },
    });
    where.centroId = centro.id;
    if (centroFilter && centroFilter !== centro.id) {
      throw new ForbiddenException();
    }
  }
  // ADMIN vê tudo: where fica {}
  
  return this.prisma.agendamento.findMany({ where });
}
```

### RN-006: Centro Deve Existir e Estar Ativo
**Descrição**: Não é possível agendar em centro inativo.

**Implementação**:
```typescript
const centro = await this.prisma.centro.findUnique({
  where: { id: createDto.centroId },
});

if (!centro || !centro.ativo) {
  throw new BadRequestException('Centro não existe ou está inativo');
}
```

### RN-007: Horário dentro Expediente
**Descrição** (Futuro): Validar agendamento dentro horários do centro.

**Placeholder**:
```typescript
// TODO RN-007: Validar dataAgendamento está dentro horaAbertura/horaFechamento
// TODO: Considerar diasAtendimento também
```

## Regras de Dados

### RD-001: Campos Obrigatórios
- `centroId`: Obrigatório
- `dataAgendamento`: Obrigatório
- `descricao`: Opcional
- `numeroVaga`: Opcional
- `observacoes`: Opcional

### RD-002: Limites de Campo

| Campo | Min | Max | Tipo |
|-------|-----|-----|------|
| descricao | 3 | 500 | String |
| observacoes | 0 | 1000 | String |
| numeroVaga | 1 | 999 | Integer |

## Regras de Segurança

### RS-001: Isolamento de Dados por Role
- Cidadão nunca vê agendamentos de outros
- Centro nunca vê agendamentos de outro centro
- Apenas ADMIN vê todos

### RS-002: Imutabilidade de Campos Críticos
Uma vez criado, campos não podem mudar:
- `userId` (cidadão)
- `centroId` (centro)
- `dataAgendamento` (data original)

### RS-003: Auditoria
Todos agendamentos mantém:
- `createdAt`: Data criação
- `updatedAt`: Última mudança
- Histórico de status (futuro)

## Testes

Todos as RNs devem ter testes:

```typescript
describe('Agendamentos RN', () => {
  it('RN-001: Deve rejeitar data no passado', async () => {
    const past = new Date(Date.now() - 1000);
    expect(() => 
      service.create({
        dataAgendamento: past,
      })
    ).toThrow('Data deve ser no futuro');
  });

  it('RN-002: Deve rejeitar duplicata', async () => {
    const dto = { centroId: 'c1', dataAgendamento: future };
    await service.create(user1, dto);
    
    expect(() =>
      service.create(user1, dto)
    ).toThrow('Já tem agendamento');
  });

  it('RN-003: Validar transições de estado', async () => {
    let agg = await service.create(user, dto);
    expect(agg.status).toBe('PENDENTE');
    
    agg = await service.update(agg.id, { status: 'CONFIRMADO' });
    expect(agg.status).toBe('CONFIRMADO');
    
    expect(() =>
      service.update(agg.id, { status: 'PENDENTE' })
    ).toThrow('Não pode fazer essa transição');
  });
});
```

## Futuras Regras

### RN-008: Limite de Agendamentos por Cidadão
- Máximo 5 agendamentos pendentes por vez
- Implementar quando sistema crescer

### RN-009: Cancelamento com Aviso Prévio
- Mínimo 24h antes da data para cancelamento sem penalidade
- Implementar sistema de penalidades (futuro)

### RN-010: Agendamentos Automáticos
- Renovação automática de agendamentos periódicos
- Implementar após MVP

---

**Última atualização**: Feb 2024  
**Responsável**: Helio & Cleusio
