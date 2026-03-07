# Plano Técnico — Migração Prisma: Alinhamento Completo com MER/DER

**Data de aprovação da decisão:** 07 de março de 2026  
**Status:** ✅ TODAS DECISÕES APROVADAS — Pronto para implementação

**Escopo atualizado:** User + Cidadao + DocumentoBI + Funcionario + Atendimento + Tabelas de referência

---

## 1) Escopo da Mudança

### Estado atual (backend `develop`)
```prisma
model User {
  id                    String   @id @default(cuid())
  email                 String   @unique
  name                  String
  password              String
  role                  Role     @default(CITIZEN)
  active                Boolean  @default(true)
  
  // BI-specific fields (civil data mixed here)
  dataNascimento        DateTime?
  provinciaNascimento   Provincia?
  provinciaResidencia   Provincia?
  numeroBIAnterior      String?
  filiacao              String?
  genero                String?
  
  // Relations
  center                Center?
  schedules             Schedule[]
  documents             Document[]
}
```

### Estado futuro (após migração)
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(CITIZEN)
  active    Boolean  @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  cidadao   Cidadao?
  center    Center?
  schedules Schedule[]
  documents Document[]
}

model Cidadao {
  id                    String   @id @default(cuid())
  
  // Dados pessoais (completos conforme MER)
  nome                  String
  sobrenome             String
  dataNascimento        DateTime
  sexo                  String   // M, F, Outro
  email                 String?  // backup de contact
  
  // Endereço residencial
  provinciaResidencia   Provincia
  municipioResidencia   String?
  bairroResidencia      String?
  ruaResidencia         String?
  numeroResidencia      String?
  
  // Dados de nascimento
  provinciaNascimento   Provincia?
  municipioNascimento   String?
  
  // Dados familiares
  estadoCivil           String?  // Single, Married, etc
  nomePai               String?
  sobrenomePai          String?
  nomeMae               String?
  sobrenomeMae          String?
  altura                Decimal? // cm
  
  // BI anterior
  numeroBIAnterior      String?
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Relação com User (1:1)
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([provinciaResidencia])
}

model DocumentoBI {
  id            String   @id @default(cuid())
  numeroBI      String   @unique
  dataEmissao   DateTime
  dataValidade  DateTime
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relação com Cidadao (1:1)
  cidadaoId String @unique
  cidadao   Cidadao @relation(fields: [cidadaoId], references: [id], onDelete: Cascade)

  @@index([cidadaoId])
  @@index([numeroBI])
}

model TipoServico {
  id          String   @id @default(cuid())
  descricao   String   @unique
  ativo       Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  agendamentos Schedule[]

  @@index([descricao])
}

model EstadoAgendamento {
  id          String   @id @default(cuid())
  descricao   String   @unique
  status      String   // AGENDADO, CONFIRMADO, CANCELADO, etc.
  ordem       Int      // sequência lógica de estados
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  agendamentos Schedule[]

  @@index([status])
  @@index([ordem])
}

model Funcionario {
  id          String   @id @default(cuid())
  nome        String
  sobrenome   String
  cargo       String
  telefoneId  String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relação com Posto (Centro)
  postoId String
  posto   Center @relation(fields: [postoId], references: [id], onDelete: Cascade)

  // Relations
  atendimentos Atendimento[]

  @@index([postoId])
  @@index([cargo])
}

model Atendimento {
  id              String   @id @default(cuid())
  dataAtendimento DateTime
  observacao      String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relação com Agendamento (1:1)
  agendamentoId String @unique
  agendamento   Schedule @relation(fields: [agendamentoId], references: [id], onDelete: Cascade)

  // Relação com Funcionario
  funcionarioId String
  funcionario   Funcionario @relation(fields: [funcionarioId], references: [id], onDelete: Restrict)

  @@index([agendamentoId])
  @@index([funcionarioId])
  @@index([dataAtendimento])
}

// Atualização do Schedule (remover enums, adicionar FKs)
model Schedule {
  id                String        @id @default(cuid())
  scheduledDate     DateTime
  slotNumber        Int?
  description       String?
  notes             String?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  centerId  String
  center    Center    @relation(fields: [centerId], references: [id], onDelete: Cascade)
  
  // FK para tabelas de referência (substituindo enums)
  tipoServicoId       String
  tipoServico         TipoServico @relation(fields: [tipoServicoId], references: [id], onDelete: Restrict)
  
  estadoAgendamentoId String
  estadoAgendamento   EstadoAgendamento @relation(fields: [estadoAgendamentoId], references: [id], onDelete: Restrict)
  
  // Relations
  documents Document[]
  protocolo Protocolo?
  atendimento Atendimento?

  @@index([userId])
  @@index([centerId])
  @@index([tipoServicoId])
  @@index([estadoAgendamentoId])
  @@index([scheduledDate])
}

// Atualização do Center (adicionar relação Funcionarios)
model Center {
  // ... campos existentes ...
  
  // Relations
  userId       String  @unique
  user         User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  schedules    Schedule[]
  funcionarios Funcionario[]
}
```

---

## 2) Impacto Cascata

### Migrações Prisma
```bash
npx prisma migrate dev --name separate_cidadao_from_user
```

**Script de migração** (SQL PostgreSQL):
```sql
-- 1. Criar tabela Cidadao
CREATE TABLE "Cidadao" (
  id TEXT NOT NULL PRIMARY KEY,
  nome TEXT NOT NULL,
  sobrenome TEXT NOT NULL,
  dataNascimento TIMESTAMP(3),
  sexo TEXT,
  email TEXT,
  provinciaResidencia TEXT,
  municipioResidencia TEXT,
  bairroResidencia TEXT,
  ruaResidencia TEXT,
  numeroResidencia TEXT,
  provinciaNascimento TEXT,
  municipioNascimento TEXT,
  estadoCivil TEXT,
  nomePai TEXT,
  sobrenomePai TEXT,
  nomeMae TEXT,
  sobrenomeMae TEXT,
  altura DECIMAL(5,2),
  numeroBIAnterior TEXT,
  "userId" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- 2. Migrar dados de User para Cidadao
INSERT INTO "Cidadao" (
  id, nome, dataNascimento, sexo, provinciaResidencia, 
  provinciaNascimento, numeroBIAnterior, "userId", "createdAt", "updatedAt"
)
SELECT 
  gen_random_uuid()::text,
  "name",
  "dataNascimento",
  "genero",
  "provinciaResidencia",
  "provinciaNascimento",
  "numeroBIAnterior",
  id,
  "createdAt",
  "updatedAt"
FROM "User"
WHERE "role" = 'CITIZEN';

-- 3. Remover colunas civis de User
ALTER TABLE "User" DROP COLUMN "name";
ALTER TABLE "User" DROP COLUMN "dataNascimento";
ALTER TABLE "User" DROP COLUMN "provinciaNascimento";
ALTER TABLE "User" DROP COLUMN "provinciaResidencia";
ALTER TABLE "User" DROP COLUMN "numeroBIAnterior";
ALTER TABLE "User" DROP COLUMN "filiacao";
ALTER TABLE "User" DROP COLUMN "genero";

-- 4. Criar índices
CREATE INDEX "Cidadao_userId_idx" ON "Cidadao"("userId");
CREATE INDEX "Cidadao_provinciaResidencia_idx" ON "Cidadao"("provinciaResidencia");
```

### DTOs Afetados (ESCOPO EXPANDIDO)
- `RegisterDto`: remover campos civis → incluir `CidadaoDto` aninhado
- `LoginDto`: sem mudança
- `ProfileDto`: retornar User + Cidadao + DocumentoBI (ou view aplanada)
- `CreateCenterDto`: sem mudança (mas Center ganha relação com Funcionarios)
- `CreateScheduleDto`: substituir `tipoBI` enum por `tipoServicoId` FK + adicionar atribuição automática de funcionário
- `UpdateScheduleDto`: substituir `status`/`biStatus` enums por `estadoAgendamentoId` FK
- **NOVOS DTOs:**
  - `CreateFuncionarioDto`
  - `CreateTipoServicoDto`
  - `CreateEstadoAgendamentoDto`
  - `CreateDocumentoBIDto`
  - `CreateAtendimentoDto`

### Endpoints Afetados
- `POST /auth/register`: novo formato (com cidadaoDto)
- `GET /users/:id`: retorna User + Cidadao + DocumentoBI
- `PUT /users/:id`: atualiza User ou Cidadao conforme payload
- `POST /schedules`: atribuição automática de funcionário
- `PUT /schedules/:id`: atualizar estado via FK (não enum)
- **NOVOS ENDPOINTS:**
  - `POST /funcionarios`, `GET /funcionarios`, `GET /funcionarios/:id`
  - `GET /tipos-servico`, `POST /tipos-servico` (admin)
  - `GET /estados-agendamento`, `POST /estados-agendamento` (admin)
  - `GET /atendimentos`, `GET /atendimentos/:id`

### Testes
- **~25 testes unitários** precisam atualização (não apenas 12)
- **41 testes E2E** precisam novos payloads + novos cenários (funcionário, atendimento)
- **Novos testes:** fluxo completo agendamento → atribuição funcionário → atendimento

---

## 3) Cronograma Proposto (ESCOPO EXPANDIDO)

| Fase | Tarefa | Duração | Prioridade |
|------|--------|---------|-----------|
| A | Aprovar schema final com BD + Lista de províncias | 1 dia | 🔴 BLOCKER |
| B1 | Implementar migração Prisma (Cidadao + DocumentoBI) | 2 dias | 🔴 ALTA |
| B2 | Implementar tabelas de referência (TipoServico + EstadoAgendamento) | 1 dia | 🔴 ALTA |
| B3 | Implementar Funcionario + Atendimento | 2 dias | 🔴 ALTA |
| B4 | Atualizar Schedule com FKs (remover enums) | 1 dia | 🔴 ALTA |
| C1 | Atualizar DTOs e services (auth, users, schedules) | 2 dias | 🟠 MÉDIA |
| C2 | Criar novos endpoints (funcionarios, atendimentos, tipos) | 1.5 dias | 🟠 MÉDIA |
| D1 | Reescrever ~25 testes unitários | 1.5 dias | 🟠 MÉDIA |
| D2 | Atualizar 41 testes E2E + criar novos cenários | 2 dias | 🟠 MÉDIA |
| E | Validar E2E + build + fluxo completo | 1.5 dias | 🟠 MÉDIA |
| F | Atualizar documentação (API, MER, fluxos) | 1 dia | 🟡 BAIXA |
| G | Seeds com dados completos (provincias, tipos, estados) | 0.5 dias | 🟡 BAIXA |

**Total estimado:** 17-18 dias de trabalho (~3.5 semanas)

**Paralelização possível:** B1-B4 podem ter sobreposição parcial se 2 devs trabalharem.

---

## 4) Riscos

### Risco 1 — Breaking change
- Qualquer cliente/frontend usando payloads antigos quebra temporariamente.
- **Mitigação:** publicar lista de endpoints e payloads alterados com 24h de antecedência.

### Risco 2 — Dados históricos incompletos
- Alguns usuários já registrados podem não ter dados civis completos.
- **Mitigação:** migration script com validações e logs de falhas.

### Risco 3 — Performance (na prática improvável)
- Duas queries (User + Cidadao) em vez de uma.
- **Mitigação:** usar eager loading (`include`) nas queries críticas.

---

## 5) Benefícios Esperados

✅ Alinhamento total com MER/DER do time de BD  
✅ Distinção clara: credenciais vs. dados civis  
✅ Facilita futura extensão (múltiplas cidadanias, etc.)  
✅ Dados civis completos para documentação e relatórios  
✅ Conformidade com regulamentações de privacidade  

---

## 6) Próximos Passos

1. **Aprovação:** confirmar schema `Cidadao` com BD
2. **Implementação:** branch `feature/cidadao-migration` a partir de `develop`
3. **Teste:** executar migração em ambiente de staging
4. **Merge:** integrar em `develop` com changelog claro

---

## 7) Doc de Referência

- [MER/DER enviado pelo time de BD](../RELATORIO_MER_BD_VS_BACKEND_2026-03-07.md)
- Contrato de payloads: (aguardando consolidação)
