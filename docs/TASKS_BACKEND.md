# Task Plan - Backend Scheduling (3 days)

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
- **PR**: `feature/helio-backend` -> `develop`

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

### Cleusio - Centers CRUD
**Estimated time: 4-5h**

- [ ] Refine `CreateCenterDto` validations
- [ ] Implement centers CRUD in service
- [ ] Implement centers endpoints in controller
- [ ] Validate hours and attendance days
- [ ] Unit tests for `CentersService`
- [ ] E2E tests for centers CRUD

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

### Cleusio - Global Validation and Endpoint Tests
**Estimated time: 3h**

- [ ] Add custom validators if needed
- [ ] Validate all endpoints created by both developers
- [ ] Validate RBAC: ADMIN > CENTER > CITIZEN
- [ ] Error handling scenarios (unauthorized, not found, invalid data)
- [ ] End-to-end flow tests (register -> login -> schedule)
- [ ] Ensure lint and format checks pass

---

## Final Checklist

### Code Quality
- [ ] `npm run lint` passes
- [ ] `npm run format:check` passes
- [ ] `npm run test` reaches target coverage
- [ ] `npm run build` passes
- [ ] No debug logs in production paths

### Documentation
- [ ] README.md updated
- [ ] docs/SCHEDULE_RULES.md updated
- [ ] docs/conceptual/ updated

### Git and Collaboration
- [ ] PR reviews completed
- [ ] `develop` stable and tested
- [ ] Merge to `main` after validation
