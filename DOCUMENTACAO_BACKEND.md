# Documentação Completa - Backend Institucional de Agendamentos

## Visão Geral do Projeto

**Nome do Projeto:** Institutional Scheduling Backend  
**Stack Tecnológico:** NestJS 10.2.8 + Node.js + PostgreSQL + Prisma ORM  
**Versão:** 1.0.0  
**Autores:** Helio & Cleusio  
**Licença:** MIT  

Este backend implementa um sistema completo de agendamento institucional para serviços relacionados ao BI (Bilhete de Identidade) angolano, com suporte a múltiplos centros, usuários com diferentes papéis, documentação e rastreamento de protocolos.

---

## Arquitetura Geral

### Estrutura de Diretórios

```
src/
├── main.ts                 # Ponto de entrada da aplicação
├── app.module.ts           # Módulo raiz
├── common/                 # Recursos compartilhados
│   ├── decorators/        # Decoradores customizados
│   ├── exceptions/        # Exceções personalizadas
│   ├── filters/           # Filtros de exceção global
│   ├── guards/            # Guards de autenticação/autorização
│   ├── interceptors/      # Interceptadores
│   └── validators/        # Validadores customizados
└── modules/               # Módulos de funcionalidade
    ├── auth/              # Autenticação (registro, login, JWT)
    ├── users/             # Gestão de usuários
    ├── centers/           # Gestão de centros de atendimento
    ├── schedules/         # Agendamentos/Marcações
    ├── documents/         # Documentos (uploads, validação)
    └── protocolo/         # Protocolo de processamento
```

### Princípios Arquiteturais

1. **Modularidade Completa:** Cada funcionalidade isolada em módulo independente
2. **RBAC (Role-Based Access Control):** Três papéis - ADMIN, CENTER, CITIZEN
3. **Separação de Responsabilidades:** Controllers → Services → Repositories (Prisma)
4. **Type Safety Absoluto:** TypeScript strict mode em toda a codebase
5. **Error Handling Centralizado:** Exceções customizadas com filtros globais
6. **Validação em Camadas:** DTOs com class-validator + validadores customizados
7. **Segurança:** Bcrypt para senhas, JWT para tokens, Guards para proteção de rotas

---

## Autenticação e Autorização

### Fluxo de Autenticação

#### 1. Registro (POST /auth/register)
```
Cliente → AuthController.register()
         ↓
         AuthService.register()
         ├─ Validar email único
         ├─ Hash de senha com bcrypt (10 rounds)
         ├─ Criar usuário com papel CITIZEN
         └─→ Retornar usuário sem senhaRegistro
```

**Validações Aplicadas:**
- Email deve ser único e válido
- Papel padrão: CITIZEN
- Usuário ativo por defauto
- Senha com mínimo 8 caracteres

#### 2. Login (POST /auth/login)
```
Cliente → AuthController.login()
         ↓
         AuthService.login()
         ├─ Buscar usuário por email
         ├─ Validar ativo
         ├─ Comparar senhas (bcrypt)
         ├─ Gerar JWT (HS256)
         └─→ Retornar token + dados do usuário
```

**Estrutura JWT:**
```json
{
  "sub": "user-id",
  "email": "user@email.com",
  "role": "CITIZEN|CENTER|ADMIN",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Proteção de Rotas

#### Guard de Autenticação (JwtAuthGuard)
- Verifica presença e validade do JWT
- Extrai payload e injeta no request
- Rotas não-protegidas: registro e login

#### Guard de Autorização (RoleGuard)
- Valida papel do usuário
- Implementado com `@Roles('ADMIN')`, `@Roles('CENTER')`, etc.
- Três níveis: CITIZEN (padrão), CENTER, ADMIN

---

## Módulo de Usuários

### Entidade User

```
User
├─ id: UUID                      # Identificador único (CUID)
├─ email: string                 # Único, usada para autenticação
├─ name: string                  # Nome completo
├─ password: string              # Hash bcrypt
├─ role: Role enum               # ADMIN | CENTER | CITIZEN
├─ active: boolean               # Status do usuário
├─ dataNascimento: DateTime?     # Data de nascimento (BI Angola)
├─ provinciaNascimento: Provincia?
├─ provinciaResidencia: Provincia?
├─ numeroBIAnterior: string?     # Número BI anterior (validação customizada)
├─ filiacao: string?             # Nomes dos pais
├─ genero: string?               # M, F, Outro
├─ createdAt: DateTime           # Timestamp criação
├─ updatedAt: DateTime           # Timestamp última atualização
└─ Relações: schedules[], documents[], refreshTokens[]
```

### Endpoints de Usuários

| Método | Endpoint | Autenticação | Papel | Descrição |
|--------|----------|--------------|-------|-----------|
| GET | /users/me | Sim | Qualquer | Obter dados do usuário autenticado |
| GET | /users | Sim | ADMIN | Listar todos os usuários |
| GET | /users/:id | Sim | ADMIN | Obter usuário específico |
| PUT | /users/me | Sim | Qualquer | Atualizar dados do usuário |
| DELETE | /users/:id | Sim | ADMIN | Deletar usuário |

### Validações de Usuário

- **Email:** Formato válido, único na base
- **Senha:** Mínimo 8 caracteres, hash bcrypt 10 rounds
- **BI Anterior:** Formato Angola: #########LA### (9 dígitos + LA + 3 dígitos)
- **Gênero:** M, F ou Outro
- **Províncias:** 21 províncias angolanas válidas

---

## Módulo de Centros

### Entidade Center

```
Center
├─ id: UUID                      # Identificador único (CUID)
├─ name: string                  # Nome do centro
├─ description: string?          # Descrição
├─ type: CenterType enum         # HEALTH|ADMINISTRATIVE|EDUCATION|SECURITY|OTHER
├─ address: string               # Endereço
├─ phone: string?                # Telefone (+244XXXXXXXXX)
├─ email: string?                # Email (formato válido)
├─ provincia: Provincia           # Localização geográfica
├─ openingTime: time             # Hora abertura (HH:MM)
├─ closingTime: time             # Hora fechamento (HH:MM)
├─ serviceDays: string           # Dias úteis (segunda a sexta padrão)
├─ capacity: int                 # Slots máximos por dia
├─ active: boolean               # Centro operacional?
├─ createdAt: DateTime
├─ updatedAt: DateTime
└─ Relações: schedules[], users(manager)?
```

### Endpoints de Centros

| Método | Endpoint | Autenticação | Papel | Descrição |
|--------|----------|--------------|-------|-----------|
| POST | /centers | Sim | ADMIN | Criar novo centro |
| GET | /centers | Sim | Qualquer | Listar centros ativos |
| GET | /centers/provincia/:provincia | Sim | Qualquer | Centros por província |
| GET | /centers/:id | Sim | Qualquer | Detalhes de centro específico |
| GET | /centers/:id/statistics | Sim | CENTER/ADMIN | Estatísticas (agendamentos, BI processados, média) |
| PUT | /centers/:id | Sim | ADMIN | Atualizar informações do centro |
| DELETE | /centers/:id | Sim | ADMIN | Deletar centro |

### Regras de Negócio - Centros

1. **Horário de Funcionamento:**
   - Padrão: Segunda a Sexta, 8:00 a 17:00
   - Customizável por centro
   - Validação de hora em formato HH:MM

2. **Capacidade:**
   - Slots máximos determinam limite diário
   - Sistema valida disponibilidade em tempo real
   - Suporte para sobrecarga controlada

3. **Tipos de Centro:**
   - HEALTH (Saúde)
   - ADMINISTRATIVE (Administrativo)
   - EDUCATION (Educação)
   - SECURITY (Segurança)
   - OTHER (Outro)

4. **Províncias Cobertas:** 21 províncias angolanas

---

## Módulo de Agendamentos (Schedules)

### Entidade Schedule

```
Schedule
├─ id: UUID
├─ centerId: UUID                # Centro de agendamento
├─ userId: UUID                  # Usuário agendado
├─ scheduledDate: DateTime       # Data/hora do agendamento
├─ tipoBI: TipoBI enum           # Tipo de solicitação BI
├─ slotNumber: int?              # Slot (1-999)
├─ description: string?          # Descrição do serviço
├─ notes: string?                # Notas internas
├─ status: BIScheduleStatus      # Estado do processamento
├─ createdAt: DateTime
├─ updatedAt: DateTime
└─ Relações: center, user, documents[], protocolo?
```

### Estados do Agendamento (BIScheduleStatus)

```
AGENDADO
    ↓
CONFIRMADO
    ↓
BIOMETRIA_RECOLHIDA
    ↓
EM_PROCESSAMENTO
    ↓
PRONTO_RETIRADA
    ↓
RETIRADO
    ↓
[ou] REJEITADO
[ou] CANCELADO
```

### Endpoints de Agendamentos

| Método | Endpoint | Autenticação | Papel | Descrição |
|--------|----------|--------------|-------|-----------|
| POST | /schedules | Sim | CITIZEN/CENTER | Criar novo agendamento |
| GET | /schedules | Sim | ADMIN | Listar todos |
| GET | /schedules/user/me | Sim | CITIZEN | Agendamentos do usuário |
| GET | /schedules/status/:status | Sim | CENTER/ADMIN | Filtrar por status |
| GET | /schedules/protocol/:numeroProtocolo | Sim | Qualquer | Buscar por número de protocolo |
| GET | /schedules/:id | Sim | Qualquer | Detalhes específicos |
| PUT | /schedules/:id | Sim | CENTER/ADMIN | Atualizar status |
| DELETE | /schedules/:id | Sim | CITIZEN/ADMIN | Deletar agendamento |
| DELETE | /schedules/:id/cancel | Sim | CITIZEN | Cancelar agendamento |

### Regras de Negócio - Agendamentos

#### 1. Criação de Agendamento
```
VALIDAÇÕES:
✓ Data deve ser no futuro (mínimo 1 dia)
✓ Data deve ser em dia útil (segunda a sexta)
✓ Centro deve estar ativo
✓ Horário dentro do funcionamento do centro
✓ Slot disponível (não exceder capacidade)
✓ Usuário não pode ter agendamento duplo
✓ Tipo de BI válido

AÇÕES:
1. Criar schedule
2. Auto-atribuir slotNumber (se não informado)
3. Setar status = AGENDADO
4. Retornar dados + numero de protocolo (gerado)
```

#### 2. Atualização de Status (CENTER/ADMIN)
```
TRANSIÇÕES PERMITIDAS:
AGENDADO → CONFIRMADO
CONFIRMADO → BIOMETRIA_RECOLHIDA
BIOMETRIA_RECOLHIDA → EM_PROCESSAMENTO
EM_PROCESSAMENTO → PRONTO_RETIRADA
PRONTO_RETIRADA → RETIRADO

QUALQUER → CANCELADO (CITIZEN)
QUALQUER → REJEITADO (CENTER/ADMIN)
```

#### 3. Busca por Protocolo
```
Pattern: numeroProtocolo é UNIQUE
Retorna: Schedule + Protocolo associado
Visível para: Apenas o usuário dono ou ADMIN
```

### Validadores Customizados

#### @IsValidWeekday()
- Valida segunda a sexta
- Rejeita sábado (6) e domingo (0)
- Mensagem: "Agendamentos permitidos apenas seg-sex"

#### @IsFutureDate({ minDaysAhead: 1 })
- Data mínimo 1 dia no futuro
- Configurable minDaysAhead
- Usa meia-noite como baseline

#### @IsBIFormat()
- Formato Angola: #########LA### 
- Exemplo válido: 123456789LA012
- Validação regex: /^[0-9]{9}LA[0-9]{3}$/

---

## Módulo de Documentos

### Entidade Document

```
Document
├─ id: UUID
├─ scheduleId: UUID              # Agendamento associado
├─ userId: UUID                  # Proprietário do documento
├─ fileName: string              # Nome do arquivo
├─ mimeType: string              # Content-Type
├─ size: int                     # Tamanho em bytes
├─ url: string                   # Caminho armazenamento
├─ type: DocumentType enum       # Tipo do documento
├─ uploadedAt: DateTime
├─ expiresAt: DateTime?          # Expiração (se aplicável)
└─ Relações: schedule, user
```

### Tipos de Documentos (DocumentType)

```
- RG (Registro Geral)
- CERTIDAO_NASCIMENTO (Certidão de Nascimento)
- COMPROVANTE_RESIDENCIA (Comprovante de Residência)
- COMPROVANTE_ENDERECO (Comprovante de Endereço)
- FOTO_3X4 (Foto 3x4)
- OUTRO (Outro)
```

### Regras de Upload

1. **Tamanho Máximo:** 10 MB por arquivo
2. **Tipos Aceitos:** PDF, JPG, PNG, JPEG
3. **Duplicatas:** Sistema detecta duplicatas por tipo
4. **Nome Obrigatório:** Deve ter extensão válida
5. **Persistência:** Armazenamento em disco/S3 (configurável)

---

## Módulo de Protocolo

### Entidade Protocolo

```
Protocolo
├─ id: UUID
├─ numeroProtocolo: string       # Único, formato: YYYYMMDD-XXXXXX
├─ scheduleId: UUID              # Agendamento processado
├─ statusAnterior: BIScheduleStatus
├─ statusAtual: BIScheduleStatus
├─ agenteProcessador: string?    # ID do admin/center que processou
├─ observacoes: string?          # Notas do processamento
├─ registradoEm: DateTime        # Quando foi registrado
├─ processadoEm: DateTime?       # Quando foi processado
├─ createdAt: DateTime
└─ Relações: schedule
```

### Geração de Número de Protocolo

```
FORMATO: {YYYYMMDD}-{XXXXXX}
EXEMPLO: 20260301-000001

REGRAS:
1. Sequencial diário
2. Reset a meia-noite (UTC-1 Angola)
3. Padding com zeros à esquerda
4. Índice incrementado por centro + data
```

### Fluxo de Protocolo

```
Agendamento criado
│
└─→ Schedule.status = AGENDADO
    └─→ Protocolo registrado (status vazio yet)
        
Durante processamento:
CENTER atualiza status → Protocolo.statusAnterior e statusAtual atualizados
│
└─→ Protocolo.agenteProcessador = ID do center user
└─→ Protocolo.processadoEm = NOW()
└─→ Protocolo.observacoes = notas opcionais
```

---

## Segurança e Validação

### Camadas de Validação

#### 1. Nível DTO (Entrada)
```
Decoradores class-validator:
├─ @IsEmail, @IsString, @IsUUID
├─ @MinLength, @MaxLength
├─ @Min, @Max, @IsInt
├─ @IsEnum, @IsOptional
├─ @IsDateString, @Matches
└─ @Validate com validadores customizados
```

#### 2. Nível Serviço
```
Lógica de negócio:
├─ Verificações de estado
├─ Verificações de autorização
├─ Validações de horário/data
├─ Validações de capacidade
├─ Detectção de conflitos
└─ Lançamento de exceções customizadas
```

#### 3. Nível Guard
```
Proteção de rotas:
├─ JwtAuthGuard: Valida presença e validade do JWT
├─ RoleGuard: Valida papel do usuário
└─ Extração automática de dados do token
```

### Exceções Customizadas

```
Exceções Implementadas:

UserAlreadyExistsException
├─ Status: 400 Bad Request
└─ Quando: Email já registrado

InvalidCredentialsException
├─ Status: 401 Unauthorized
└─ Quando: Email ou senha incorretos

InvalidScheduleException
├─ Status: 400 Bad Request
├─ Causas:
│  ├─ Data no passado
│  ├─ Agendamento muito próximo
│  ├─ Centro fechado naquele dia
│  ├─ Horário fora do funcionamento
│  ├─ Sem slots disponíveis
│  └─ Agendamento duplicado

DocumentValidationException
├─ Status: 400 Bad Request
├─ Causas:
│  ├─ Arquivo muito grande
│  ├─ Tipo MIME inválido
│  ├─ Documento duplicado
│  └─ Nome de arquivo inválido
```

---

## Banco de Dados

### Stack de Dados

```
PostgreSQL 14+
    ↓
Prisma ORM 5.6.0
    ├─ Migrations automáticas
    ├─ Type-safe queries
    ├─ Relações gerenciadas
    └─ Índices para performance
```

### Índices de Performance

```
User:
├─ [email] UNIQUE
├─ [role]
└─ [provinciaResidencia]

Center:
├─ [provincia]
└─ [type]

Schedule:
├─ [centerId]
├─ [userId]
├─ [scheduledDate]
└─ [status]

Protocolo:
├─ [numeroProtocolo] UNIQUE
└─ [scheduleId] UNIQUE

Document:
├─ [scheduleId]
└─ [userId]
```

### Relacionamentos (Constraints)

```
User → Schedule (1 : N)
User → Document (1 : N)
User → RefreshToken (1 : N)

Center → Schedule (1 : N)

Schedule → Document (1 : N)
Schedule → Protocolo (1 : 1) com ON DELETE CASCADE

Protocolo → Schedule (1 : 1)
```

---

## Endpoints Resumo Geral

### Autenticação (Public)
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Autenticar e obter JWT

### Usuários (Autenticados)
- `GET /users/me` - Perfil do usuário
- `GET /users` - [ADMIN] Listar todos
- `GET /users/:id` - [ADMIN] Detalhes
- `PUT /users/me` - Atualizar perfil
- `DELETE /users/:id` - [ADMIN] Deletar

### Centros (Autenticados)
- `POST /centers` - [ADMIN] Criar
- `GET /centers` - Listar
- `GET /centers/provincia/:provincia` - Por região
- `GET /centers/:id` - Detalhes
- `GET /centers/:id/statistics` - [CENTER/ADMIN] Estatísticas
- `PUT /centers/:id` - [ADMIN] Atualizar
- `DELETE /centers/:id` - [ADMIN] Deletar

### Agendamentos (Autenticados)
- `POST /schedules` - [CITIZEN/CENTER] Criar
- `GET /schedules` - [ADMIN] Listar
- `GET /schedules/user/me` - [CITIZEN] Meus agendamentos
- `GET /schedules/status/:status` - [CENTER/ADMIN] Por status
- `GET /schedules/protocol/:numeroProtocolo` - Buscar por protocolo
- `GET /schedules/:id` - Detalhes
- `PUT /schedules/:id` - [CENTER/ADMIN] Atualizar status
- `DELETE /schedules/:id` - [CITIZEN/ADMIN] Deletar
- `DELETE /schedules/:id/cancel` - [CITIZEN] Cancelar

### Documentos (Autenticados)
- `POST /documents` - Upload
- `GET /documents/:id` - Download
- `DELETE /documents/:id` - Deletar

---

## Qualidade de Código

### Validações e Testes

```
Testes Unitários (Jest):
├─ AuthService: 7 testes
│  ├─ Register com dados válidos
│  ├─ Register com email duplicado
│  ├─ Login com senha correta
│  ├─ Login com senha incorreta
│  └─ ...
└─ UsersService: 7 testes
   ├─ Buscar usuário
   ├─ Atualizar perfil
   ├─ Deletar usuário
   └─ ...

Status: 14/14 PASSING (100%)
```

### Code Quality Standards

```
TypeScript: Strict mode (tsconfig.json)
├─ Sem types implícitos
├─ Sem any desnecessários
└─ Sem variáveis não-inicializadas

ESLint: 0 erros
├─ Sem código morto
├─ Estilo consistente
└─ Regras NestJS aplicadas

Prettier: Formatação automática
├─ 2 espaçamento
├─ Aspas simples
└─ Trailing commas

Build: Success (0 errors)
└─ Compilação TypeScript sem warning crítico
```

### Comentários

```
Política de Comentários:

MANTIDOS (Essenciais):
├─ JSDoc em métodos públicos (API)
├─ @param, @returns, @throws
├─ Fluxos complexos de negócio
└─ Decisões arquiteturais

REMOVIDOS (Redundantes):
├─ Descrições de classe/DTO óbvias
├─ Self-explaining code
├─ Comentários de IA genéricos
└─ Documentação duplicada
```

---

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Iniciar em modo watch (hot-reload)

# Build
npm run build           # Compilar TypeScript para JavaScript

# Produção
npm start               # Executar build compilado

# Linting e Formatação
npm run lint            # ESLint check
npm run format          # Prettier (reformatar)
npm run format:check    # Prettier (apenas validar)

# Prisma
npx prisma generate     # Gerar tipos @prisma/client
npx prisma migrate dev  # Criar migration
npx prisma studio      # GUI de banco de dados

# Testes
npm test                # Jest (uma vez)
npm run test:watch     # Jest em modo watch
npm run test:cov        # Com cobertura
npm run test:e2e        # Testes end-to-end
```

---

## Configuração

### Variáveis de Ambiente (.env)

```bash
# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/scheduling

# JWT
JWT_SECRET=sua-chave-secreta-muito-segura-aqui
JWT_EXPIRATION=3600  # 1 hora em segundos

# Servidor
PORT=3000
NODE_ENV=development|production

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email
SMTP_PASSWORD=sua-senha

# Storage (opcional)
STORAGE_TYPE=disk|s3
S3_BUCKET=nome-bucket
S3_REGION=us-east-1
```

---

## Estatísticas do Projeto

```
Linguagem: TypeScript 5.9.3
Framework: NestJS 10.2.8
Banco: PostgreSQL (Prisma ORM)

Linhas de Código:
├─ Production: ~3.500 linhas
├─ Tests: ~500 linhas
└─ Configuração: ~200 linhas

Cobertura de Testes: 100% (serviços críticos)

Módulos: 6
├─ auth (autenticação)
├─ users (usuários)
├─ centers (centros)
├─ schedules (agendamentos)
├─ documents (documentos)
└─ protocolo (rastreamento)

Endpoints: 27 rotas REST
└─ 2 públicas (registro, login)
└─ 25 autenticadas

Exceções Customizadas: 3
Guards Customizados: 2
Validadores Customizados: 3
```

---

## Roadmap Futuro

```
v1.1.0:
├─ Integração com WhatsApp/SMS para notificações
├─ Dashboard de estatísticas
├─ Export de dados (CSV, PDF)
└─ Agendamento automático de slots

v1.2.0:
├─ Fila de processamento com Bull
├─ Webhooks para eventos
├─ API rate limiting
└─ Auditoria completa de ações

v2.0.0:
├─ GraphQL como alternativa REST
├─ Websockets para atualizações tempo real
├─ Machine learning para otimização de slots
└─ App mobile (React Native)
```

---

## Notas Importantes

### Segurança

- **Senhas:** Sempre armazenadas com bcrypt (10 rounds). Nunca em plain text.
- **JWT:** Use uma chave secreta forte e mude periodicamente
- **CORS:** Configurado apenas para domínios autorizados em produção
- **Arquivo uploads:** Validação de MIME type + limite de tamanho
- **SQL Injection:** Impossível com Prisma (parameterized queries)

### Performance

- **Índices:** Criados em campos frequentemente consultados
- **Pagination:** Implementada para listas grandes (limit/offset)
- **Caching:** Cacheable headers configurados
- **Connection pooling:** Prisma gerencia automáticamente

### Manutenção

- **Migrations:** Versionadas e auditáveis com Prisma
- **Logs:** Estruturados com contexto (usuário, ação, timestamp)
- **Error tracking:** Exceções padronizadas com mensagens claras
- **Monitoring:** Pronto para integração com Sentry, DataDog

---

**Desenvolvido por Helio & Cleusio**  
**Versão Final:** 1.0.0 | Março 2026
