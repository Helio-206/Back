# Relatório de Alinhamento — MER/DER (BD) vs Backend Atual

**Data:** 07 de março de 2026  
**Base avaliada:** branch develop (backend principal)

---

## 1) Resumo Executivo

O MER/DER enviado pelo time de BD está **parcialmente alinhado** ao backend atual.  
A base do domínio (cidadão, posto/centro, agendamento) existe, porém há diferenças relevantes de modelagem que precisam de alinhamento antes de evoluir front e integrações.

**Conclusão rápida:**
- Backend atual: pronto para Auth + Users + Centers + Schedules.
- MER BD: mais detalhado em dados civis/familiares e operação presencial (funcionário/atendimento).
- Necessário: acordo de contrato de dados para evitar retrabalho.

---

## 2) Mapeamento de Entidades (MER → Backend)

### Aderência direta
- `POSTO_ATENDIMENTO` ↔ `Center`
- `AGENDAMENTO` ↔ `Schedule`

### Aderência com decisão de divergência (aprovada pelo time de BD)
- `CIDADAO` → tabela **dedicada** (não incorporada em `User`)
  - Decision: BD quer separação clara entre credenciais de acesso (User) e dados civis (Cidadao)
  - Impacto no Prisma: criar model `Cidadao` com FK a `User` (1:1)

### Aderência parcial (aprovado migração para tabelas)
- `DOCUMENTO_BI` → criar tabela dedicada nesta sprint (número, emissão, validade, FK cidadão)
- `ESTADO_AGENDAMENTO` → migrar de enum para tabela de referência
- `TIPO_SERVICO` → migrar de enum para tabela de referência

### Não mapeado no backend atual (aprovado para esta sprint)
- `TELEFONE` (tabela dedicada)
- `FUNCIONARIO` → implementar para atribuição automática no agendamento
- `ATENDIMENTO` → criar fluxo completo funcionário ↔ cidadão

---

## 3) Diferenças Críticas

1. **Cardinalidade e granularidade de dados civis** ✅ RESOLVIDO
   - MER separa `nome`/`sobrenome`, endereço completo, estado civil, altura e filiação detalhada.
   - Backend atual: vai migrar para tabela dedicada `Cidadao` com separação clara de credenciais (`User`) vs. dados civis.
   - Impacto: User ficará mais leve; Cidadao conterá campos detalhados.

2. **Documento civil principal (BI)** ✅ RESOLVIDO
   - MER tem entidade própria `DOCUMENTO_BI` (número, emissão, validade, FK cidadão).
   - Backend: vai implementar tabela dedicada nesta sprint.
   - Razão: fornecer dados previamente para acelerar emissão presencial.

3. **Modelo operacional de atendimento presencial** ✅ RESOLVIDO
   - MER inclui `FUNCIONARIO` e `ATENDIMENTO` (execução por agente).
   - Backend: vai implementar nesta sprint.
   - Fluxo: no momento do agendamento, cidadão será direcionado a um funcionário específico.

4. **Normalização de referência** ✅ RESOLVIDO
   - MER usa tabelas para `TIPO_SERVICO` e `ESTADO_AGENDAMENTO`.
   - Backend: vai migrar enums para tabelas nesta sprint.
   - Razão: sistema de agendamento precisa especificar tipos de serviço dinamicamente.

5. **Enum de províncias no backend** ⏳ AGUARDANDO (1h)
   - Enum `Provincia` no backend está incompleto e com inconsistências de nomenclatura (`BIES`, `ZAI`).
   - Time de BD enviará lista oficial completa das 24 províncias em ~1h.

---

## 4) Impacto no Frontend (design recebido)

As primeiras telas (login, registro, perfil, agendar, estado) podem iniciar já, mas com contrato claro:

- **Pode integrar agora**: auth, perfil básico, listagem/ação de agendamentos, centros.
- **Depende de alinhamento BD**: campos civis detalhados, histórico de atendimento por funcionário, BI formal emitido, estados em tabela.

Sem esse alinhamento, o risco é montar formulários e payloads que mudam em seguida.

---

## 5) Decisão Técnica Recomendada

### Curto prazo (sem travar entregas)
1. Manter backend atual como base funcional.
2. Criar branch de frontend e iniciar telas com DTOs atuais.
3. Abrir “Matriz de Compatibilidade” com BD para fechar divergências.

### Médio prazo (alinhamento estrutural) — TODAS AS AÇÕES APROVADAS
1. **Implementar migração Prisma — Cidadao**
   - Separar `User` (apenas auth + role) de `Cidadao` (dados civis completos)
   - Relacionamento 1:1 entre User e Cidadao
   - Atualizar DTOs de registro e perfil conforme novo contrato

2. **Migrar enums para tabelas de referência**
   - `TIPO_SERVICO`: criar tabela com id + descrição
   - `ESTADO_AGENDAMENTO`: criar tabela com id + descrição + status
   - Atualizar FK em `Schedule`

3. **Criar tabela DOCUMENTO_BI**
   - Campos: numero_bi (UNIQUE), data_emissao, data_validade, id_cidadao (FK)
   - Objetivo: fornecer dados previamente para agilizar emissão presencial

4. **Implementar FUNCIONARIO e ATENDIMENTO**
   - Tabela `Funcionario` com FK para `Posto` (Centro)
   - Tabela `Atendimento` ligando agendamento ↔ funcionário
   - Atribuição automática de funcionário ao criar agendamento

5. **Atualizar enum Provincia** (aguardando lista oficial do BD em ~1h)

---

## 6) Plano de Convergência (proposto)

### Fase A — Contrato único (1-2 dias)
- Workshop rápido Backend + BD + Front.
- Congelar contrato v1 (payloads e campos obrigatórios).

### Fase B — Migração controlada (5-7 dias — escopo expandido)
- Ajustes no Prisma com migrations incrementais:
  - Model `Cidadao`
  - Model `DocumentoBI`
  - Model `Funcionario`
  - Model `Atendimento`
  - Tabelas `TipoServico` e `EstadoAgendamento`
- Atualização de `Schedule` para FKs em vez de enums
- Compatibilidade temporária para não quebrar endpoints existentes

### Fase C — Consolidação (2-3 dias)
- Atualizar 69 testes unitários + 41 testes E2E
- Reescrever seeds com dados completos
- Publicar changelog de contrato para o front
- Validar fluxo completo: registro → agendamento → atribuição funcionário → atendimento

---

## 7) Decisões aprovadas do time de BD

✅ **Todas as decisões aprovadas para implementação nesta sprint:**

1. **`CIDADAO`**: tabela dedicada (separada de `User`)
   
2. **`TIPO_SERVICO` e `ESTADO_AGENDAMENTO`**: tabelas de referência
   - Justificativa: sistema de agendamento precisa especificar tipos dinamicamente

3. **`DOCUMENTO_BI`**: implementar nesta sprint
   - Justificativa: fornecer dados previamente; emissão acelerada no atendimento presencial

4. **`FUNCIONARIO` e `ATENDIMENTO`**: implementar nesta sprint
   - Justificativa: cada agendamento direciona cidadão a funcionário específico
   - Fluxo: agendamento → atribuição automática de funcionário → atendimento

⏳ **Aguardando (entrega em ~1h):**
5. **Lista oficial de províncias** (24 províncias de Angola com nomenclatura canônica)

---

## 8) Parecer Final

O MER/DER está bom como visão de domínio completo, mas o backend principal está em estágio mais enxuto e funcional.  
A recomendação é **não bloquear o front**, iniciar sobre o contrato atual e fazer convergência por fases com o time de BD, priorizando os pontos de maior impacto (províncias, documento BI formal, atendimento por funcionário).
