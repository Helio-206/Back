# Fluxo de Negócio: Sistema de Agendamento

## 1. Caso de Uso: Agendamento de Cidadão

### Pré-requisitos
- Cidadão tem conta e está autenticado
- Centro existe e está ativo
- Data de agendamento é futura
- Centro tem capacidade

### Fluxo Principal

```
1. CIDADÃO BUSCA CENTROS
   GET /centros
   └─ Retorna lista de centros ativos

2. CIDADÃO CONSULTA AGENDAMENTOS DISPONÍVEIS
   GET /agendamentos?centroId=xyz
   └─ Mostra agendamentos existentes
   └─ Cidadão identifica slot disponível

3. CIDADÃO CRIA AGENDAMENTO
   POST /agendamentos
   Body: {
     centroId: "xyz",
     dataAgendamento: "2024-03-01T10:00:00Z",
     descricao: "Consulta de saúde"
   }
   └─ Status = PENDENTE

4. CENTRO RECEBE NOTIFICAÇÃO
   └─ Centro vê agendamento pendente
   └─ Centro pode confirmar ou rejeitar

5. CENTRO CONFIRMA
   PUT /agendamentos/id
   Body: { status: "CONFIRMADO" }
   └─ Status = CONFIRMADO
   └─ Cidadão recebe confirmação

6. DIA DO AGENDAMENTO
   Cidadão comparece
   Centro marca como EM_PROGRESSO
   Após conclusão: CONCLUIDO
```

### Fluxo Alternativo: Cancelamento

```
Cidadão Solicita Cancelamento
   └─ DELETE /agendamentos/:id/cancel
   └─ Status = CANCELADO
   └─ Histórico preservado
```

## 2. Caso de Uso: Gestão de Centro

### Criação de Centro

```
1. CENTRO-USER REALIZA LOGIN
   POST /auth/login
   └─ Recebe JWT

2. CENTRO-USER CRIA SEU CENTRO
   POST /centros (com JWT)
   Body: {
     nome: "Centro de Saúde Principal",
     tipo: "SAUDE",
     endereco: "Rua X, 123",
     horaAbertura: "08:00",
     horaFechamento: "18:00",
     diasAtendimento: "SEGUNDA,TERCA,QUARTA,QUINTA,SEXTA"
   }
   └─ Centro criado e associado ao user

3. CENTRO VISUALIZA SEU DASHBOARD
   GET /centros/:id
   └─ Dados do centro
   └─ Lista de agendamentos
```

### Gestão de Agendamentos do Centro

```
CENTRO VÊ AGENDAMENTOS PENDENTES
GET /agendamentos?centroId=xyz

CENTRO CONFIRMA AGENDAMENTO
PUT /agendamentos/:id
Body: { status: "CONFIRMADO" }

CENTRO MARCA COMO EM PROGRESSO/CONCLUIDO
PUT /agendamentos/:id
Body: { status: "EM_PROGRESSO" | "CONCLUIDO" }
```

## 3. Caso de Uso: Admin - Supervisão

```
ADMIN ACESSO TOTAL:
- GET /users - Todos os utilizadores
- GET /centros - Todos os centros
- GET /agendamentos - Todos os agendamentos
- Pode editar/deletar qualquer recurso
```

## 4. Regras de Negócio Implementadas

### Agendamentos
| Regra | Implementação |
|-------|---------------|
| Não duplicar agendamento | Validação no Service |
| Data deve ser futura | Validação no DTO |
| Cidadão não pode editar após confirmação | Guard + Service check |
| Centro não pode exceder capacidade | Validação no Service (futuro) |

### Segurança de Dados
| Aspecto | Implementação |
|--------|-----------------|
| Senhas | Bcrypt 10 rounds |
| JWT | Válido 24h |
| RBAC | Guards + Decorators |
| SQL Injection | Prisma (prepared statements) |
| Dados sensíveis | Nunca retorna password |

## 5. Diagrama de Estados - Agendamento

```
        ┌──────────┐
        │ PENDENTE │
        └─────┬────┘
              │
              ├─→ CONFIRMADO ──┬──→ EM_PROGRESSO ──→ CONCLUIDO
              │                │
              └────────────→ CANCELADO
```

## 6. Permissões por Role

| Ação | ADMIN | CENTRO | CIDADAO |
|------|-------|--------|---------|
| Ver todos os users | [completed] | [not-allowed] | [not-allowed] |
| Ver todos os centros | [completed] | [completed] | [completed] |
| Criar centro | [not-allowed] | [completed] | [not-allowed] |
| Editar próprio centro | [completed] | [completed] | [not-allowed] |
| Criar agendamento | [not-allowed] | [not-allowed] | [completed] |
| Ver próprios agendamentos | [completed] | [completed] | [completed] |
| Ver agendamentos centro | [completed] | [completed] | [not-allowed] |
| Confirmar agendamento | [completed] | [completed] | [not-allowed] |
| Deletar agendamento | [completed] | [not-allowed] | [completed] |

