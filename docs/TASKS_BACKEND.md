# Task Plan - Backend Scheduling (3 days)

## Pre-flight (Obrigatório antes do Day 1)
- [ ] Branch base sincronizada com `develop`
- [ ] PostgreSQL disponível e `DATABASE_URL` validada
- [ ] Migrations aplicadas com `npx prisma migrate deploy`
- [ ] Seed mínimo com centros em LUANDA/BENGUELA/HUAMBO
- [ ] Exemplos de BI padronizados no formato `#########LA###` (fictício)

**Bloqueadores que param desenvolvimento:**
- Sem banco ou sem migrations aplicadas
- Sem seed mínimo de centros
- Divergência de schema entre branches

## Overview
- **Helio**: Auth, security, schedule creation
- **Cleusio**: Centers, schedule read/management, validations and endpoint tests

---

## Day 1 - Setup and Auth

### Helio - Auth and Security
**Estimated time: 4-5h**

- [ ] Validate project structure and dependencies
- [ ] Validate `npm install` and `npm run dev`
- [ ] Complete `RegisterDto` validations
- [ ] Complete `LoginDto` validations
- [ ] Test `/auth/register` and `/auth/login`
- [ ] Define proper error handling for auth
- [ ] Unit tests for `AuthService`
- [ ] Validate `numeroBIAnterior` with format `#########LA###` for renewals
- **PR**: `feature/helio-backend` -> `develop`

**Definition of Done (Day 1 / Helio):**
- Register/Login funcional com testes a passar
- Erros de autenticação consistentes
- Build sem regressão

### Cleusio - Prisma and Database
**Estimated time: 3-4h**

- [ ] Validate project structure and dependencies
- [ ] Test `npm install`
- [ ] Review User/Center relation in schema
- [ ] Create initial migration: `npm run prisma:migrate`
- [ ] Validate Prisma Studio: `npm run prisma:studio`
- [ ] Seed data for development
- [ ] Test PostgreSQL connection
- **PR**: `feature/cleusio-backend` -> `develop`

**Definition of Done (Day 1 / Cleusio):**
- Migrations aplicadas sem erro
- Seed executado com dados mínimos
- Conexão e consultas básicas validadas

---

## Day 2 - Centers and Schedules

### Helio - Schedule Creation
**Estimated time: 4-5h**

- [ ] Finalize `CreateScheduleDto` validations
- [ ] Implement `SchedulesService.create()`
- [ ] Implement `POST /schedules`
- [ ] Validate: future date, center exists, no duplicates
- [ ] Unit tests for creation
- [ ] E2E tests for `POST /schedules`
- [ ] Update docs/SCHEDULE_RULES.md

**Definition of Done (Day 2 / Helio):**
- `POST /schedules` validado em sucesso e erro
- Regras de data futura e duplicidade cobertas por testes

### Cleusio - Centers CRUD
**Estimated time: 4-5h**

- [ ] Refine `CreateCenterDto` validations
- [ ] Implement centers CRUD in service
- [ ] Implement centers endpoints in controller
- [ ] Validate hours and attendance days
- [ ] Unit tests for `CentersService`
- [ ] E2E tests for centers CRUD

**Definition of Done (Day 2 / Cleusio):**
- CRUD de centros funcional
- Filtro por província funcional
- Validações de horário e dias cobertas por testes

---

## Day 3 - Schedule Read/Management and Final Review

### Helio - Schedule Read and Management
**Estimated time: 3h**

- [ ] Implement `findAll`, `findByUser`, `findByCenter`
- [ ] Implement GET endpoints
- [ ] Implement status updates (confirm, in progress, complete)
- [ ] Implement cancellation and deletion
- [ ] Validate permissions by role
- [ ] Unit tests for schedule management
- [ ] E2E tests for read and management

**Definition of Done (Day 3 / Helio):**
- Endpoints de leitura e gestão funcionais
- Permissões por perfil validadas
- Cancelamento sem perda de histórico

### Cleusio - Global Validation and Endpoint Tests
**Estimated time: 3h**

- [ ] Add custom validators if needed
- [ ] Validate all endpoints created by both developers
- [ ] Validate RBAC: ADMIN > CENTER > CITIZEN
- [ ] Error handling scenarios (unauthorized, not found, invalid data)
- [ ] End-to-end flow tests (register -> login -> schedule)
- [ ] Ensure lint and format checks pass

**Definition of Done (Day 3 / Cleusio):**
- Fluxo E2E principal validado
- RBAC e mensagens de erro consistentes
- Lint sem erros e build estável

---

## Final Checklist

### Code Quality
- [ ] `npm run lint` passes
- [ ] `npm run format:check` passes
- [ ] `npm run test` reaches target coverage
- [ ] `npm run build` passes
- [ ] No debug logs in production paths
- [ ] `npx prisma generate` passes

### Documentation
- [ ] README.md updated
- [ ] docs/SCHEDULE_RULES.md updated
- [ ] docs/conceptual/ updated

### Git and Collaboration
- [ ] PR reviews completed
- [ ] `develop` stable and tested
- [ ] Merge to `main` after validation

### Go/No-Go (Release interna)
- [ ] Build e testes passam em `develop`
- [ ] Migrations testadas em ambiente limpo
- [ ] Lint sem erros (warnings documentados)
- [ ] Fluxo crítico validado: register -> login -> schedule -> status
