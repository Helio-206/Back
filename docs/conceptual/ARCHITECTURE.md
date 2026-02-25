# Architecture and Technical Decisions

## 1. High-Level Architecture

```
Client (Web/Mobile)
    |
    v
NestJS API
  - Controllers (REST)
  - Services (business logic)
  - Guards, Pipes, Filters, Interceptors
  - Prisma ORM
    |
    v
PostgreSQL
```

## 2. Patterns Used

### 2.1 Modular Architecture
- Each domain (Auth, Users, Centers, Schedules) is an independent module
- Enables parallel development and clear ownership
- Reduces coupling between components

### 2.2 Service Layer
- Controllers handle HTTP input/output only
- Services implement business logic
- Supports unit testing and reuse

### 2.3 DTO Validation
- Clear separation between input data and domain models
- Validation at the transport layer
- Prevents unsafe payloads

### 2.4 RBAC with Guards
- Role-based access control
- JWT authentication
- Reusable, composable guards

## 3. Request Pipeline

```
Request
  -> Middleware (CORS, logging)
  -> Guards (JWT, role checks)
  -> Pipes (validation, transformation)
  -> Controller
  -> Service
  -> Prisma
  -> Interceptors (logging, response)
  -> Filters (error handling)
Response
```

## 4. Security

### 4.1 Authentication
- JWT with 24h validity
- Refresh tokens for renewal
- bcrypt password hashing (10 rounds)

### 4.2 Authorization
- Roles: ADMIN, CENTER, CITIZEN
- Guards enforce permissions per route
- Data isolation by role context

### 4.3 Validation
- Global `ValidationPipe` in `main.ts`
- DTOs validated with class-validator
- Input sanitation by whitelist

## 5. Error Handling

### Strategy
1. `HttpExceptionFilter` catches errors
2. Consistent response shape
3. Structured logging
4. Correct HTTP status codes

### Example Error Response
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

## 6. Scalability

### Horizontal
- Stateless API
- JWT-based sessions
- Ready for caching (Redis)

### Vertical
- Indexed columns in Prisma schema
- Pagination planned for list endpoints
- Avoids over-fetching

## 7. Developer Experience

- Hot reload: `npm run dev`
- TypeScript type safety
- ESLint + Prettier
- Jest for tests
- Prisma Studio for data inspection
