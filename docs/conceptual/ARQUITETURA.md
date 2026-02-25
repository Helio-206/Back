# Arquitetura e Decisões Técnicas

## 1. Arquitetura Geral

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                            │
│              (React/Vue/Angular)                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                       NestJS                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Controllers (REST API)                          │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐   │
│  │  Services (Business Logic)                       │   │
│  │  - AuthService, UsersService, CentrosService     │   │
│  │  - AgendamentosService                           │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐   │
│  │  Guards, Pipes, Filters, Interceptors           │   │
│  │  - JWT Validation                                │   │
│  │  - Role-based Access Control                     │   │
│  │  - Exception Handling                            │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐   │
│  │  Prisma (Database ORM)                          │   │
│  └──────────────┬───────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
         ┌──────────────────────┐
         │    PostgreSQL        │
         │    Database          │
         └──────────────────────┘
```

## 2. Padrões Utilizados

### 2.1 Modular Pattern
- Cada domínio (Auth, Users, Centros, Agendamentos) é um módulo independente
- Facilita escalabilidade e desenvolvimento paralelo
- Reduz acoplamento entre componentes

### 2.2 Service Layer Pattern
- Controllers lidam apenas com requisições/respostas HTTP
- Services contêm a lógica de negócio
- Facilita testes unitários

### 2.3 DTO (Data Transfer Object)
- Separação clara entre dados de entrada e modelos internos
- Validação em camada de transporte
- Segurança: nunca expõe o modelo completo

### 2.4 Guard Pattern (RBAC)
- Controle de acesso baseado em roles
- JWT para autenticação
- Guards reutilizáveis e componíveis

## 3. Pipeline de Requisição

```
Request
   ↓
Middleware (CORS, Logger)
   ↓
Guards (JWT Validation, Role Check)
   ↓
Pipes (Validation, Transformation)
   ↓
Controller Handler
   ↓
Service Logic
   ↓
Prisma DB Call
   ↓
Interceptor (Logging, Response Format)
   ↓
Filter (Exception Handling)
   ↓
Response
```

## 4. Segurança

### 4.1 Autenticação
- JWT com validade de 24h
- Refresh tokens para renovação
- Hash bcrypt para senhas (10 rounds)

### 4.2 Autorização
- RBAC com 3 roles: ADMIN, CENTRO, CIDADAO
- Guards verificam permissões antes de executar handlers
- Isolamento de dados por context

### 4.3 Validação
- ValidationPipe global em main.ts
- DTOs com class-validator
- Sanitização de inputs

## 5. Tratamento de Erros

### Estratégia:
1. **HttpExceptionFilter** captura exceções
2. Formata resposta consistente
3. Logs estruturados
4. Status HTTP apropriados

### Exemplo de Resposta de Erro:
```json
{
  "statusCode": 400,
  "timestamp": "2024-02-25T10:30:00.000Z",
  "path": "/api/resource",
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "errors": ["must be an email"]
    }
  ]
}
```

## 6. Escalabilidade

### Horizontal:
- Stateless API (fácil distribuir em múltiplas instâncias)
- JWT para sessões (não precisa de server-side state)
- Cache pronto para implementação (Redis)

### Vertical:
- Índices no Prisma schema para queries frequentes
- Lazy loading de relações
- Paginação nos endpoints de listagem (futuro)

## 7. Development Experience

- HMR (Hot Module Replacement) com `npm run dev`
- TypeScript: type safety completo
- ESLint + Prettier: code quality automatizado
- Jest: testing framework pronto
- Prisma Studio: visualização de dados
