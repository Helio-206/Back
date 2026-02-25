# Distribución de Tarefas - Backend Agendamento (3 dias)

## Overview
- **Hélio**: Auth, Segurança, Agendamentos (Criação)
- **Cleusio**: Centros, Agendamentos (Leitura/Gestão), Validações & Testes

---

## DIA 1 - Setup & Auth

### Helio - Auth & Segurança
**Duração estimada: 4-5h**

- [x] Validar estrutura do projeto gerada
- [x] Testar `npm install` e `npm run dev`
- [ ] Implementar RegisterDto com validações completas
- [ ] Implementar LoginDto com validações
- [ ] Testar endpoints `/auth/register` e `/auth/login` manualmente
- [ ] Configurar error handling correto para auth
- [ ] Testes unitários para AuthService
- [ ] Documentar endpoints auth em docs/ENDPOINTS.md
- **PR**: `feature/helio-auth` → `develop`

### Cleusio - Setup & Prisma
**Duração estimada: 3-4h**

- [x] Validar estrutura do projeto gerada
- [x] Testar npm install
- [ ] Verificar relação User-Centro na schema
- [ ] Criar migration inicial: `npm run prisma:migrate`
- [ ] Testar Prisma Studio: `npm run prisma:studio`
- [ ] Configurar database seed com dados de teste
- [ ] Testar conexão com PostgreSQL
- [ ] Documentar setup em docs/DATABASE_SETUP.md
- **PR**: `feature/cleusio-database-setup` → `develop`

---

## DIA 2 - Modulos Centros & Agendamentos

### Helio - Agendamentos Fase 1 (Criação)
**Duração estimada: 4-5h**

- [ ] Finalizar CreateAgendamentoDto com todas validações
- [ ] Implementar AgendamentosService.create()
- [ ] Implementar AgendamentosController POST /agendamentos
- [ ] Validar: data futura, centro existe, sem duplicatas
- [ ] Testes unitários para create
- [ ] Testes e2e para POST /agendamentos
- [ ] Documentar regras de negócio em docs/AGENDAMENTOS_REGRAS.md
- **PR**: `feature/helio-agendamentos-create` → `develop`

### Cleusio - Centros CRUD Completo
**Duração estimada: 4-5h**

- [ ] Refinar CreateCentroDto com validações
- [ ] Implementar CentrosService completo (create, read, update, delete)
- [ ] Implementar CentrosController com todas rotas
- [ ] Validar horários e dias de funcionamento
- [ ] Testes unitários para CentrosService
- [ ] Testes e2e para CRUD de centros
- [ ] Documentar endpoints em docs/ENDPOINTS.md
- **PR**: `feature/cleusio-centros-crud` → `develop`

---

## DIA 3 - Agendamentos (Leitura/Gestão) & Testes & Merge Final

### Helio - Agendamentos Fase 2 (Leitura & Gestão)
**Duração estimada: 3h**

- [ ] Implementar AgendamentosService.findAll(), findByUser(), findByCentro()
- [ ] Implementar GET endpoints em controller
- [ ] Implementar PUT para mudar status (confirm, progress, complete)
- [ ] Implementar DELETE para cancelar e deletar
- [ ] Validar permissões: cidadao só vê seus, centro só seu centro
- [ ] Testes unitários para todas funções
- [ ] Testes e2e para leitura e gestão
- **PR**: `feature/helio-agendamentos-management` → `develop`

### Cleusio - Validações Globais & Testes Endpoints
**Duração estimada: 3h**

- [ ] Implementar validadores customizados se necessário
- [ ] Tester TODOS endpoints implementados por Hélio
- [ ] Tester TODOS endpoints implementados por Cleusio
- [ ] Validar RBAC: admin > centro > cidadao
- [ ] Testar cenários de erro (não autorizado, não encontrado, etc)
- [ ] Testar fluxos completos (registro → login → agendamento)
- [ ] Coverage de testes mínimo 70%
- [ ] ESLint e Prettier passar sem erros
- [ ] Documentação completa em /docs

---

## Checklist Final (Dia 3 - Tarde)

### Code Quality
- [ ] `npm run lint` sem erros
- [ ] `npm run format` check passing
- [ ] `npm run test` 70%+ coverage
- [ ] `npm run build` sem erros
- [ ] Sem console.logs em producão

### Documentação
- [ ] README.md completo
- [ ] ENDPOINTS.md com curl examples
- [ ] AGENDAMENTOS_REGRAS.md
- [ ] DATABASE_SETUP.md
- [ ] CONTRIBUTING.md
- [ ] /docs/conceptual/ completo
- [ ] /docs/adr/ com decisões
- [ ] /docs/api/ com swagger placeholder

### Git & Collaboration
- [ ] Branches strategy implementada
- [ ] Templates de PR e Issues configurados
- [ ] .gitignore correto
- [ ] Conventional commits em todos PRs
- [ ] Code reviews cruzados completos
- [ ] PRs mergeados em develop
- [ ] develop ready para produção
- [ ] main tag com v1.0.0

### Deployment Ready
- [ ] Dockerfile criado (estrutura)
- [ ] docker-compose.yml para dev
- [ ] Scripts de deploy prontos
- [ ] Variáveis de ambiente documentadas
- [ ] Estrutura para logs preparada
- [ ] Estrutura para rate-limiting preparada
- [ ] Estrutura para caching preparada

---

## Comunicação & Sincronização

### Diário (Standup 10min cada manhã)
- [9:30] O que cada um fez ontem?
- [9:30] O que vai fazer hoje?
- [9:40] Há blockers?
- [9:50] Próximos passos

### Merge Requests
- Requerer review de cada outro
- Mínimo 1 aprovação antes de merge
- Não deixar PRs abertas overnight sem feedback

### Pair Programming (se necessário)
- Bloqueadores críticos
- Decisões de design complexas
- Integração entre módulos

---

## Exemplo de Progresso Diário

### DIA 1 - Manhã (Hélio)
```
git checkout develop && git pull
git checkout -b feature/helio-auth
# Implementar auth...
npm run dev  # Testar
npm run lint
git commit -m "feat(auth): implementar registro e login com JWT"
git push origin feature/helio-auth
# Criar PR
```

### DIA 1 - Manhã (Cleusio)
```
git checkout develop && git pull
git checkout -b feature/cleusio-database
# Setupar prisma...
npm run prisma:studio
npm run prisma:seed
# Validar dados...
git commit -m "chore(database): configurar prisma e seed inicial"
git push origin feature/cleusio-database
# Criar PR
```

### DIA 1 - Tarde
- Revisão cruzada dos PRs
- Merge após aprovação
- Sincronizar branches locais

---

## Recursos Disponíveis

### Estrutura Já Criada
Pastas organizadas  
NestJS configurado  
Prisma schema  
Módulos base  
Guards e Decorators  
DTOs estruturados  
ESLint e Prettier  
Jest configurado  
Documentação templates  

### Próximos Passos (Após v1.0.0)
- [ ] Swagger automático
- [ ] Docker & CI/CD
- [ ] Logs estruturados com Winston
- [ ] Rate limiting
- [ ] Caching com Redis
- [ ] Tests cobertos 90%+
- [ ] API versioning
- [ ] Load testing

