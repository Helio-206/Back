# 📋 Sistema de Agendamento - Regularização do BI Angola

**Documentação Completa de Funcionalidades**

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Funcionalidades Principais](#funcionalidades-principais)
3. [Gestão de Utilizadores](#gestão-de-utilizadores)
4. [Gestão de Centros](#gestão-de-centros)
5. [Agendamento de Consultas](#agendamento-de-consultas)
6. [Gestão de Documentos](#gestão-de-documentos)
7. [Rastreamento de Protocolo](#rastreamento-de-protocolo)
8. [Ciclo de Vida do BI](#ciclo-de-vida-do-bi)
9. [Relatórios e Estatísticas](#relatórios-e-estatísticas)
10. [Validações e Regras de Negócio](#validações-e-regras-de-negócio)
11. [Arquitetura Técnica](#arquitetura-técnica)
12. [Modelos de Dados](#modelos-de-dados)
13. [Fluxos de Negócio](#fluxos-de-negócio)

---

## 🎯 Visão Geral

Sistema web de agendamento e gestão de **Bilhete de Identidade (BI)** para Angola, desenvolvido com o objetivo de:

- ✅ Facilitar o agendamento de consultas em centros provinciais para regularização de BI
- ✅ Digitalizar o processo de recolha de documentos
- ✅ Rastrear o progresso de cada aplicação de BI
- ✅ Organizar a distribuição de capacidade nos centros de emissão
- ✅ Gerar relatórios e estatísticas de utilizador

**Público-alvo:**
- Cidadãos angolanos (primeira emissão, renovação ou atualização)
- Operadores de centros (processamento de aplicações)
- Administradores (gestão global, relatórios, suporte)

**Cobertura Geográfica:** 24 províncias de Angola

---

## ✅ Alinhamento com o backend principal (develop)

**Última verificação técnica:** 6 de março de 2026

### Implementado no backend atual
- Autenticação JWT (`/auth/register`, `/auth/login`)
- Gestão de utilizadores (`/users`)
- Gestão de centros (`/centers`)
- Agendamentos (`/schedules`)
- RBAC com papéis `CITIZEN`, `CENTER`, `ADMIN`
- Guards de acesso por recurso para agendamentos

### Ainda não implementado no backend atual (apenas roadmap neste documento)
- Upload e gestão de documentos
- Rastreamento de protocolo
- Relatórios e dashboards avançados
- Refresh token
- MFA e notificações
- Swagger/OpenAPI

---

## 🎯 Funcionalidades Principais

### 1️⃣ **Autenticação e Controlo de Acesso**

#### Login
- Autenticação JWT com email e palavra-passe
- Tokens de acesso com validade de **24 horas**
- Tokens de refresh para renovação de sessão (**roadmap; não implementado no backend atual**)
- Endpoints públicos e privados

#### Níveis de Acesso
- **CITIZEN**: Cidadãos comuns (maioria da funcionalidade)
- **CENTER**: Operadores de centros (processamento de BI)
- **ADMIN**: Administradores (gestão global do sistema)

#### Segurança
- Encriptação de palavra-passe com bcrypt (10 salt rounds)
- Proteção CORS configurada
- Validação de autorização em rotas sensíveis

---

### 2️⃣ **Gestão de Utilizadores**

#### Registo de Cidadão
- Email único no sistema
- Nome completo
- Número de BI anterior (se houver): Formato `#########LA###`
- Data de nascimento
- Email e contacto telefónico
- Endereço completo (rua, número, bairro, município, província)
- Nacionalidade (padrão: Angola)

#### Perfil de Utilizador
- Visualização de dados pessoais
- Histórico de agendamentos
- Estado de documentos carregados
- Rastreamento de protocolos
- Atualização de dados de contacto

#### Gestão de Contas
- Alteração de palavra-passe
- Recuperação de conta
- Eliminação de conta (com cascata: agendamentos, documentos, protocolos)

---

### 3️⃣ **Gestão de Centros**

#### Cadastro de Centro
- Nome do centro
- Localização: Endereço, bairro, município, **província**
- Tipo de centro:
  - SAUDE
  - ADMINISTRATIVO
  - EDUCACAO
  - SEGURANCA
  - OUTRO

#### Configuração Operacional
- **Horário de funcionamento**: 08:00 - 17:00 (padrão configurável)
- **Capacidade de agentes**: Número máximo de atendimentos simultâneos
- **Dias úteis**: Segunda a sexta-feira
- **Feriados**: Datas em que o centro está fechado

#### Relacionamento
- Um centro por **província**
- Mapeamento de utilizador CENTER ↔ Centro (um-para-um)
- Rastreamento de agendamentos por centro

#### Operações
- Listar centros por província
- Consultar disponibilidade de agentes
- Atualizar configurações
- Desativar centro (sem eliminar histórico)

---

### 4️⃣ **Agendamento de Consultas**

#### Criar Agendamento
- Seleção do centro (por província)
- Escolha da **data de consulta** com validações:
  - Mínimo: **1 dia útil no futuro**
  - Máximo: **30 dias** (janela de agendamento)
  - Apenas **segunda a sexta** (dias úteis)
  - Dentro do horário: 08:00 - 17:00

#### Tipos de Solicitação de BI
1. **NOVO**: Primeira emissão de BI
2. **RENOVACAO**: BI expirado ou próximo de expirar
3. **PERDA**: Perda de BI anterior
4. **EXTRAVIO**: Roubo ou furto de BI
5. **ATUALIZACAO_DADOS**: Correção ou atualização de dados no BI anterior

#### Limitações e Balanceamento
- **Limite de agendamentos por dia por centro**: Baseado em capacidade de agentes
- **Um agendamento por cidadão por data**: Evitar duplicação
- **Confirmação automática**: Status inicial = AGENDADO

#### Visualização
- Listar agendamentos do cidadão (com filtros por estado)
- Detalhe de agendamento (data, hora, local, tipo BI, documentos necessários)
- Histórico de mudanças de estado

#### Rescisão
- Cancelar agendamento (até 24h antes com notificação)
- Remarcação prioritária (cancela e gera novo horário)

---

### 5️⃣ **Upload e Gestão de Documentos**

> **Estado no backend principal (develop):** Não implementado (roadmap)

#### Documentos Obrigatórios
1. **RG** (Registado na Conservatória)
2. **Certidão de Nascimento**
3. **Comprovante de Residência**
4. **Foto 3x4** (Formato específico)

#### Validações de Arquivo
- **Formatos aceitos**: JPEG, PNG, PDF
- **Tamanho máximo**: 5 MB por arquivo
- **Total máximo por agendamento**: 20 MB
- **Resolução mínima de foto**: 300x300 pixels
- **Formato de foto**: JPG ou PNG (sem fundo)

#### Armazenamento
- S3 (configurável em production)
- Disco local (desenvolvimento)
- Caminho: `/uploads/{scheduleId}/{documentType}`
- URL pública para ténicas de verificação manual

#### Ciclo de Vida do Documento
- **PENDENTE**: Aguardando upload
- **CARREGADO**: Arquivo enviado e validado
- **VERIFICADO**: Conferido pelo operador do centro
- **REJEITADO**: Documento inválido com motivo

#### Operações
- Upload múltiplo (drag-and-drop)
- Visualizar documento
- Descarregar documento
- Reenviar após rejeição

---

### 6️⃣ **Rastreamento de Protocolo**

> **Estado no backend principal (develop):** Não implementado (roadmap)

#### Número de Protocolo
- **Formato**: `BI-YYYY-MM-XXXXX`
- **Exemplo**: `BI-2026-02-00001`
- **Composição**:
  - `BI`: Prefixo fixo
  - `YYYY`: Ano (2026)
  - `MM`: Mês (01-12)
  - `XXXXX`: Sequencial por província (00001-99999)
- **Geração automática**: Ao confirmar agendamento

#### Recibo de Protocolo
- Número único de rastreamento
- Dados do requerente
- Tipo de BI solicitado
- Data e local da consulta
- Documentos necessários
- QR Code para rastrear online

#### Histórico de Mudanças
- Log de cada transição de estado
- Timestamp com data/hora
- Utilizador responsável pela mudança
- Observações (motivo de rejeição, etc.)

#### Consulta Pública
- Rastrear protocolo por número
- Consultar estado atual
- Ver histórico de atualizações
- Receber notificações por email

---

### 7️⃣ **Ciclo de Vida do BI**

#### Estados e Transições

```
┌─────────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA DO BI                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. AGENDADO                                                    │
│     ✓ Consulta marcada no sistema                              │
│     ✓ Documentos obrigatórios definidos                         │
│     → Próximo: CONFIRMADO (cidadão apresenta-se)               │
│     → Alternativa: CANCELADO                                    │
│                                                                   │
│  2. CONFIRMADO                                                  │
│     ✓ Cidadão presente no centro                               │
│     ✓ Documentos conferidos pelo agente                         │
│     → Próximo: BIOMETRIA_RECOLHIDA (se aceite)                │
│     → Alternativa: REJEITADO (documentos incompletos)           │
│                                                                   │
│  3. BIOMETRIA_RECOLHIDA                                        │
│     ✓ Impressões digitais registadas                            │
│     ✓ Foto biométrica recolhida                                 │
│     ✓ Assinatura digital registada                              │
│     → Próximo: EM_PROCESSAMENTO                                 │
│                                                                   │
│  4. EM_PROCESSAMENTO                                            │
│     ✓ Sob processamento no Ministério (15-30 dias)             │
│     ✓ Verificação de antecedentes                               │
│     ✓ Impressão do documento                                    │
│     → Próximo: PRONTO_RETIRADA (sucesso)                        │
│     → Alternativa: REJEITADO (falha na verificação)             │
│                                                                   │
│  5. PRONTO_RETIRADA                                             │
│     ✓ BI impresso e pronto                                      │
│     ✓ Notificação enviada ao cidadão                            │
│     ✓ Período de levantamento: 30 dias                          │
│     → Próximo: RETIRADO (levantado pelo cidadão)               │
│     → Alternativa: CANCELADO (não levantado após 30 dias)       │
│                                                                   │
│  6. RETIRADO                                                    │
│     ✓ BI entregue ao cidadão                                    │
│     ✓ Assinatura de recebimento registada                       │
│     → Estado final ✓                                            │
│                                                                   │
│  7. REJEITADO (Terminal)                                        │
│     ✗ Documentos incompletos/inválidos                          │
│     ✗ Falha na verificação                                      │
│     → Motivo registado com detalhes                             │
│     → Cidadão recebe notificação com instruções                 │
│     → Opção: Novo agendamento                                   │
│                                                                   │
│  8. CANCELADO (Terminal)                                        │
│     ✗ Cancelado pelo cidadão (até 24h antes)                   │
│     ✗ Cancelado pelo administrador (causa documentada)          │
│     → Cidadão pode remarcar                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

#### Dados Associados a Cada Estado
- **Estado**: Código do estado atual
- **Timestamp**: Data e hora da mudança
- **Agente responsável**: Utilizador que efetuou a mudança
- **Observações**: Motivo, comentários, instruções
- **Documentos**: Anexos de suporte

---

### 8️⃣ **Relatórios e Estatísticas**

> **Estado no backend principal (develop):** Não implementado (roadmap)

#### Dashboards Disponíveis

**Para ADMIN:**
- Total de agendamentos (por período)
- Taxa de conclusão (RETIRADO / Total)
- Estados dos agendamentos (gráfico pizza)
- Distribuição por tipo de BI (NOVO vs RENOVACAO)
- Distribuição por centro (tabela com counts)
- Distribuição por província (mapa)
- Tempo médio de processamento (dias)
- Taxa de rejeição por centro
- Taxa de rejeição por tipo de documento

**Para CENTER:**
- Agendamentos do seu centro (hoje, semana, mês)
- Pendentes de confirmação
- Com documentos rejeitados
- Prontos para levantamento
- Capacidade de agentes vs utilização

**Para CITIZEN:**
- Estado atual do meu BI
- Data estimada de retirada
- Histórico de agendamentos
- Documentos carregados (status)

#### Métricas Chave
```
- Agendamentos por província
- Agendamentos por tipo de BI
- Agendamentos por estado
- Taxa de conclusão (%)
- Tempo médio de processamento
- Taxa de rejeição (%)
- Ocupação de centros (%)
- Documentos carregados vs necessários
```

#### Exportação
- CSV para análise em Excel
- PDF para relatórios formais
- Dados agregados (sem informação pessoal)

---

### 9️⃣ **Validações e Regras de Negócio**

#### Validações de Utilizador
- ✅ Email único no sistema
- ✅ Email válido e confirmado
- ✅ Nome completo (mínimo 5 caracteres)
- ✅ Data de nascimento válida (maiores de 18 anos)
- ✅ Telefone em formato internacional
- ✅ BI anterior: Formato `#########LA###` (se fornecido)

#### Validações de Disponibilidade
- ✅ Data mínima: +1 dia útil
- ✅ Data máxima: +30 dias
- ✅ Não agendamentos em fins de semana
- ✅ Não agendamentos em feriados
- ✅ Dentro do horário do centro (08:00-17:00)
- ✅ Capacidade de agentes disponível
- ✅ Um agendamento por data e centro por cidadão

#### Validações de Documentos
- ✅ Formatos aceitos: JPEG, PNG, PDF
- ✅ Tamanho máximo: 5 MB
- ✅ Total por consulta: 20 MB
- ✅ Foto: Resolução mínima 300x300
- ✅ Todos os documentos obrigatórios carregados

#### Validações de Cascata
- ✅ Eliminar utilizador → Eliminar agendamentos, documentos, protocolos
- ✅ Eliminar centro → Redirecionar ou arquivar agendamentos
- ✅ Transição de estado → Validar documentos completos

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

| Componente | Tecnologia | Versão |
|-----------|-----------|--------|
| **Framework** | NestJS | 10.x |
| **Runtime** | Node.js | 18+ |
| **Linguagem** | TypeScript | 5.x |
| **Banco de Dados** | PostgreSQL | 14+ |
| **ORM** | Prisma | 5.6.0 |
| **Autenticação** | JWT + Passport | latest |
| **Armazenamento** | S3 / Disco Local | - |
| **Validação** | class-validator | 0.14.x |
| **Serialização** | class-transformer | 0.5.x |
| **Testes** | Jest | 29.x |
| **Documentação** | Swagger/OpenAPI | 7.x |

### Estrutura de Diretórios

```
src/
├── app.module.ts              # Módulo raiz
├── main.ts                    # Ponto de entrada
├── common/                    # Código partilhado
│   ├── decorators/           # Auth, Roles, Current User
│   ├── exceptions/           # Custom exceptions
│   ├── filters/              # Global exception filters
│   ├── guards/               # JWT, Roles guards
│   ├── interceptors/         # Logging, transformação
│   └── validators/           # Custom validators
├── database/                 # Configuração Prisma
│   ├── database.module.ts
│   └── prisma.service.ts
└── modules/                  # Funcionalidades
    ├── auth/                 # Login, JWT, estratégias
    ├── users/                # CRUD de utilizadores
    ├── centers/              # CRUD de centros
    ├── schedules/            # Agendamentos e rastreamento
    ├── documents/            # Upload e validação
    └── protocolo/            # Número de protocolo
```

---

## 💾 Modelos de Dados

### User (Utilizador)

```typescript
{
  id: UUID
  email: string (unique)
  password: string (bcrypt encrypted)
  firstName: string
  lastName: string
  dateOfBirth: Date
  phoneNumber: string
  previousBiNumber?: string  // #########LA### format
  province: Province enum
  municipality: string
  neighborhood: string
  street: string
  houseNumber: string
  role: Role (CITIZEN | CENTER | ADMIN)
  center?: Center (se role = CENTER)
  schedules: Schedule[]
  documents: Document[]
  createdAt: Date
  updatedAt: Date
}
```

### Center (Centro de Emissão)

```typescript
{
  id: UUID
  name: string
  province: Province enum
  municipality: string
  neighborhood: string
  street: string
  houseNumber: string
  type: CenterType enum
  capacityPerDay: number     // Agentes disponíveis
  openingHour: Time          // 08:00
  closingHour: Time          // 17:00
  operator: User (role = CENTER)
  schedules: Schedule[]
  createdAt: Date
  updatedAt: Date
}
```

### Schedule (Agendamento)

```typescript
{
  id: UUID
  citizen: User
  center: Center
  biType: BiType enum       // NOVO | RENOVACAO | PERDA | EXTRAVIO | ATUALIZACAO
  scheduledDate: Date
  status: BiStatus enum     // Estados do ciclo de vida
  protocol: Protocolo
  documents: Document[]
  notes: string
  rejectionReason?: string
  assignedAgent?: User      // Agente que confirmou
  confirmedAt?: Date
  biometryCollectedAt?: Date
  readyForPickupAt?: Date
  pickedUpAt?: Date
  cancellationReason?: string
  cancelledAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Document (Documento Carregado)

```typescript
{
  id: UUID
  schedule: Schedule
  type: DocumentType enum   // RG | CERTIDAO | COMPROVANTE | FOTO
  fileUrl: string
  fileName: string
  fileSize: number          // em bytes
  mimeType: string         // image/jpeg, application/pdf
  status: DocumentStatus enum // PENDENTE | CARREGADO | VERIFICADO | REJEITADO
  rejectionReason?: string
  verifiedBy?: User
  verifiedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Protocolo (Rastreamento)

```typescript
{
  id: UUID
  protocolNumber: string    // BI-YYYY-MM-XXXXX
  schedule: Schedule
  citizen: User
  type: BiType enum
  status: BiStatus enum
  statusHistory: StatusChangeEvent[]
  createdAt: Date
  updatedAt: Date
}

StatusChangeEvent {
  status: BiStatus
  timestamp: Date
  changedBy: User
  notes: string
}
```

### RefreshToken (Sessão)

```typescript
{
  id: UUID
  user: User
  token: string (hash)
  expiresAt: Date
  createdAt: Date
}
```

---

## 📊 Fluxos de Negócio

### 1️⃣ **Fluxo de Agendamento (Cidadão)**

```
1. Cidadão efetua login
2. Seleciona "Novo Agendamento"
3. Escolhe tipo de BI (NOVO, RENOVACAO, etc.)
4. Seleciona província → Centro
5. Escolhe data disponível (validações)
6. Confirma agendamento
7. Sistema gera Protocolo (BI-YYYY-MM-XXXXX)
8. Cidadão recebe confirmação + recibo
9. Sistema recolhe documentos (TODO)
10. Cidadão carrega documentos obrigatórios
11. Agendamento = AGENDADO (Estado inicial)
```

### 2️⃣ **Fluxo de Processamento (Operador)**

```
1. Operador faz login no centro
2. Vê lista de agendamentos do dia
3. Chama cidadão → Status = CONFIRMADO
4. Verifica documentos:
   - Se OK → Recolhe biometria → Status = BIOMETRIA_RECOLHIDA
   - Se não OK → Status = REJEITADO + Motivo
5. Envia para processamento → Status = EM_PROCESSAMENTO
6. Após 15-30 dias → Status = PRONTO_RETIRADA
7. Cidadão notificado via email + SMS
8. Cidadão retira BI → Status = RETIRADO
```

### 3️⃣ **Fluxo de Rastreamento (Cidadão)**

```
1. Cidadão recebe Protocolo: BI-2026-02-00001
2. Acesso a qualquer momento via site/app
3. Consulta número de protocolo
4. Vê estado atual e histórico
5. Recebe notificações nas transições chave:
   - Agendamento confirmado
   - Documentos verificados
   - BI pronto para retirada
   - BI entregue
```

### 4️⃣ **Fluxo de Relatórios (Admin)**

```
1. Admin acesso ao dashboard
2. Seleciona período (mês, ano)
3. Visualiza métricas por:
   - Distribuição por tipo de BI
   - Taxa de conclusão
   - Tempo médio
   - Centro com melhor performance
4. Exporta dados em CSV/PDF
5. Identifica gargalos e otimizações
```

---

## 🔐 Permissões por Papel

| Operação | CITIZEN | CENTER | ADMIN |
|----------|---------|--------|-------|
| Criar agendamento | ✅ | ✅ | ✅ |
| Ver próprio agendamento | ✅ | - | ✅ |
| Ver agendamentos do centro | - | ✅ | ✅ |
| Confirmar agendamento | - | ✅ | ✅ |
| Rejeitar documentos | - | ✅ | ✅ |
| Cambiar estado BI | - | ✅ | ✅ |
| Carregar documentos | ✅ | - | - |
| Ver protocolo | ✅ | ✅ | ✅ |
| Criar centro | - | - | ✅ |
| Editar centro | - | - | ✅ |
| Ver relatórios | - | ✅ (seu centro) | ✅ |
| Criar utilizador | ✅ (auto) | - | ✅ |
| Ver utilizadores | - | - | ✅ |
| Eliminar utilizador | - | - | ✅ |

---

## 🌍 Cobertura Geográfica

### 24 Províncias de Angola

1. **Bengo**
2. **Benguela**
3. **Bié**
4. **Cabinda**
5. **Cuando Cubango**
6. **Cuanza Norte**
7. **Cuanza Sul**
8. **Cunene**
9. **Huambo**
10. **Huíla**
11. **Kwando Kubango**
12. **Kwanza Norte**
13. **Kwanza Sul**
14. **Luanda**
15. **Lunda Norte**
16. **Lunda Sul**
17. **Malanje**
18. **Moxico**
19. **Namibe**
20. **Uíge**
21. **Zaíre**
22. (e mais 3 em desenvolvimento)

**Um centro de referência por província** (expansível no futuro)

---

## 📈 Status Atual do Projeto

| Componente | Status | Notas |
|-----------|--------|-------|
| Schema de BD | ✅ Completo | Prisma schema definido |
| Modelos ORM | ✅ Completo | Todas as entidades |
| Enums/Tipos | ✅ Completo | Províncias, estados, tipos |
| Autenticação | ✅ Completo | JWT (register/login) |
| CRUD Utilizadores | ✅ Parcial | Listar, buscar por id, desativar |
| CRUD Centros | ✅ Completo | Cadastro, listagem, edição, desativar/reativar |
| Agendamentos | ✅ Completo | Criar, listar, atualizar estado, cancelar, eliminar |
| Upload Documentos | ⏳ Planejado | Ainda não implementado no backend |
| Protocolo | ⏳ Planejado | Ainda não implementado no backend |
| Relatórios | ⚠️ Parcial | Endpoint de estatísticas de centros para ADMIN |
| Testes | ⚠️ Parcial | 69 unitários OK; 41 E2E OK + 1 suite E2E com erro de import |
| Documentação API | ⏳ Planejado | Swagger/OpenAPI |

---

## 🚀 Próximas Etapas

1. **Corrigir suite E2E de agendamentos** (`import request from 'supertest'`)
2. **Implementar módulo de documentos** (upload, validação, armazenamento)
3. **Implementar módulo de protocolo** (geração e rastreamento)
4. **Expandir relatórios** para além das estatísticas de centros
5. **Adicionar refresh tokens** e gestão de sessão
6. **Adicionar documentação Swagger/OpenAPI**
7. **Integrar notificações** (email/SMS/push)
8. **Escalabilidade**: cache e filas

---

**Versão do Documento:** 1.1  
**Data:** 6 de março de 2026  
**Autor:** Time de Desenvolvimento

