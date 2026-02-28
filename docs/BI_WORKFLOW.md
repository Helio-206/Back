# Workflow Operacional: Sistema de Agendamento BI Angola

**Status:** MVP Phase  
**Data:** February 28, 2026  
**Equipe:** Backend (Cleusio), Database Team, Center Operators

---



### O Que Está Pronto
- Backend base (NestJS, authenticated, builds com sucesso)
- Database schema completo para BI Angola
- User/Center/Schedule/Document/Protocolo models
- Enums para provincias, tipos de BI, status

### O Que Precisa Ser Implementado

#### [BACKEND] Endpoints Essenciais (Cleusio)

**1. Citizen Registration (POST /auth/register)**
```
Request:
{
  email: string,
  password: string,
  name: string,
  dataNascimento: Date,
  provinciaResidencia: Provincia,
  genero: "M" | "F" | "Outro",
  numeroBIAnterior?: string  // formato: #########LA### (ex.: 123456789LA123) para renovação
}

Response:
{
  id: string,
  email: string,
  name: string,
  role: "CITIZEN"
}
```

**2. View Centers (GET /centers?provincia=LUANDA)**
```
Response: [
  {
    id: string,
    name: "Centro de BI Luanda",
    provincia: "LUANDA",
    address: string,
    phone: string,
    openingTime: "08:00",
    closingTime: "17:00",
    capacidadeAgentos: 5
  }
]
```

**3. Book Appointment (POST /schedules)**
```
Request:
{
  centerId: string,
  scheduledDate: DateTime,
  tipoBI: "NOVO" | "RENOVACAO" | "PERDA" | "EXTRAVIO",
  description?: string
}

Response:
{
  id: string,
  scheduleId: string,
  numeroProtocolo: "BI-2026-02-00001",
  biStatus: "AGENDADO",
  scheduledDate: DateTime
}
```

**4. Upload Document (POST /documents)**
```
Request: multipart/form-data
{
  file: File,
  documentType: "RG" | "CERTIDAO_NASCIMENTO" | "COMPROVANTE_RESIDENCIA",
  scheduleId: string
}

Response:
{
  id: string,
  fileName: string,
  fileUrl: "https://storage.example.com/...",
  documentType: string,
  uploadedAt: DateTime
}
```

**5. Check Appointment Status (GET /schedules/:id)**
```
Response:
{
  id: string,
  scheduledDate: DateTime,
  tipoBI: "NOVO",
  biStatus: "AGENDADO",
  numeroProtocolo: "BI-2026-02-00001",
  documents: [
    { documentType: "RG", fileUrl: "...", uploadedAt: "..." }
  ],
  center: { name: string, address: string }
}
```

**6. Lookup Receipt (GET /protocolo/:numeroProtocolo)**
```
Response:
{
  numeroProtocolo: "BI-2026-02-00001",
  scheduledDate: DateTime,
  biStatus: "PRONTO_RETIRADA",
  nbiEmitido: "123456789LA123",
  observacoes: "BI ready for pickup at center"
}
```

#### [DATABASE] Initial Setup (Database Team)

```bash
# 1. Create database
createdb sistema_bi_angola -U postgres

# 2. Run migrations
cd /home/helio/Back
npx prisma migrate deploy

# 3. Generate Prisma client
npx prisma generate

# 4. (Optional) Seed test centers
npx prisma db seed
```

#### [BACKEND] Seed Script (Cleusio + Database Team)

Create `/prisma/seed.ts` with test data:

```typescript
// Seed 3 test centers (one per province)
import { PrismaClient, Provincia, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bi.ao' },
    update: {},
    create: {
      email: 'admin@bi.ao',
      name: 'Administrator',
      password: await hashPassword('AdminPass123'),
      role: Role.ADMIN,
      genero: 'M',
      provinciaResidencia: Provincia.LUANDA,
    },
  });

  // Center managers
  const centerLuanda = await prisma.user.create({
    data: {
      email: 'centro.luanda@bi.ao',
      name: 'Centro de BI Luanda - Maianga',
      password: await hashPassword('CenterPass123'),
      role: Role.CENTER,
      provinciaResidencia: Provincia.LUANDA,
      center: {
        create: {
          name: 'Centro de BI Luanda - Maianga',
          provincia: Provincia.LUANDA,
          address: 'Rua Rainha Nzinga, Maianga, Luanda',
          phone: '+244222123456',
          email: 'centro.luanda@bi.ao',
          capacidadeAgentos: 8,
        },
      },
    },
  });

  // Similar for Benguela and Huambo...
}

main().catch(console.error);
```

---

## Timeline & Checkpoints

### Week 1 (Now)
- [ ] Database Team: PostgreSQL setup + create DB + run migrations
- [ ] Cleusio: Implement 6 endpoints above (register, centers, book, upload, status, lookup)
- [ ] Both: Test locally with seed data

### Week 2
- [ ] Cleusio: Add validation (document requirements, date checks)
- [ ] Database Team: Create indexes, test query performance
- [ ] Both: End-to-end flow testing (register → book → upload → check status)

### Week 3
- [ ] Cleusio: Error handling, friendly error messages
- [ ] All: Prepare for next phase review
- [ ] Documentation update for frontend team

---

## Critical Success Factors for MVP

### Database
- Schema reflects all BI fields (USER: dataNascimento, provinciaResidencia, etc)
- Document foreign keys correct (Document → Schedule → User)
- Protocol number unique per schedule
- Backup strategy in place

### Backend
- Endpoints respond within 500ms (optimize queries)
- Error messages in Portuguese (or English depending on client)
- JWT tokens validate correctly
- File uploads validate MIME type + size
- Role-based access (CITIZEN can't see other schedules)

### Testing
- [ ] Create test account (register as CITIZEN)
- [ ] Book appointment at test center
- [ ] Upload documents (RG, photo, residence proof)
- [ ] Verify status transitions
- [ ] Lookup by protocol number

---

## Blockers & Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| DB performance with 100K+ users | 🔴 High | Use indexes + pagination, profile queries |
| Document storage cost | 🟠 Medium | Use S3 or evaluate on-premise limits |
| Biometric data security | 🔴 High | Encrypt at rest, separate secure DB later |
| Integration with SNAP (Ministry system) | 🟠 Medium | Out of scope MVP, stub with mock API |
| SMS/Email notifications not critical | 🟡 Low | Phase 2, start with manual notifications |

---

## What Cleusio Has to Do (Detailed)

### Backend Checklist

**Authentication & Users**
- [ ] POST /auth/register → Create CITIZEN user + hash password
- [ ] POST /auth/login → Return JWT token
- [ ] GET /auth/me → Return current user with BI fields
- [ ] PUT /auth/profile → Update user BI fields (dataNascimento, etc)

**Centers**
- [ ] GET /centers → List all active centers
- [ ] GET /centers?provincia=LUANDA → Filter by province
- [ ] GET /centers/:id → Get center details + available slots

**Schedules**
- [ ] POST /schedules → Create new appointment
  - Validate: centerId exists, scheduledDate in future, within center hours
  - Validate documents if RENOVACAO (needs previous BI #)
- [ ] GET /schedules → List my appointments (auth required)
- [ ] GET /schedules/:id → View one appointment detail
- [ ] GET /schedules?status=PRONTO_RETIRADA → Filter by BI status
- [ ] PUT /schedules/:id → Update (only certain fields: description)
- [ ] DELETE /schedules/:id → Cancel (change status to CANCELADO)

**Documents**
- [ ] POST /documents → Upload document
  - Validate file (JPEG, PDF only, max 5MB)
  - Save to storage (S3 or disk)
  - Create Document record with fileUrl
- [ ] GET /documents → List my documents
- [ ] GET /documents?scheduleId=... → Get docs for appointment
- [ ] DELETE /documents/:id → Remove document

**Protocolo/Receipt**
- [ ] GET /protocolo/:numeroProtocolo → Lookup by receipt number
- [ ] POST /protocolo → Auto-generate on Schedule creation
- [ ] PUT /protocolo/:id (ADMIN/CENTER only) → Update status

**Data Validation (DTOs)**
```typescript
// Example validation in DTOs
export class CreateScheduleDto {
  @IsString()
  centerId!: string;

  @IsDateString()
  scheduledDate!: string; // ISO format YYYY-MM-DD

  @IsEnum(TipoBI)
  tipoBI!: TipoBI;

  @IsOptional()
  @IsString()
  description?: string;
}

// In Schedule service, validate:
- scheduledDate >= today + 1 day
- scheduledDate within center openingTime/closingTime
- scheduledDate aligns with attendanceDays
- If tipoBI NOVO: require CERTIDAO_NASCIMENTO + COMPROVANTE_RESIDENCIA
```

---

## What Database Team Has to Do

**Pre-Launch Checklist**
- [ ] PostgreSQL 14+ installed
- [ ] Database `sistema_bi_angola` created
- [ ] Migrations applied (`npx prisma migrate deploy`)
- [ ] Prisma Client generated (`npx prisma generate`)
- [ ] Test data seeded (at least 3 centers + 1 admin)
- [ ] Backups automated (daily)
- [ ] Performance indexes confirmed
  ```sql
  -- Check indexes exist
  SELECT * FROM pg_indexes WHERE tablename IN ('User', 'Schedule', 'Document');
  ```

**Ongoing Monitoring**
```bash
# Connection pooling
# Set in DATABASE_URL: ?schema=public&sslmode=require&pgbouncer=true

# Monitor slow queries (after 30 days data)
# Set: log_min_duration_statement = 1000  # Log queries > 1s
```

---

## Communication Protocol

### Daily Standup (10min)
- Blockers?
- Merges needed?
- Any DB/backend issues?

### Weekly Sync (30min)
- Progress on checklist items
- Performance metrics
- Plan for next phase

### When Stuck
- **Backend issue?** → Consult database team for schema details
- **Database issue?** → Consult backend team for data flow
- **Workflow questions?** → Review this document or contact team lead

---

## Files & Locations

| Purpose | Location |
|---------|----------|
| Database schema | `/home/helio/Back/prisma/schema.prisma` |
| Schema docs | `/home/helio/Back/docs/DATABASE_SCHEMA.md` |
| Seed script | `/home/helio/Back/prisma/seed.ts` |
| Auth module | `/home/helio/Back/src/modules/auth/` |
| Schedules module | `/home/helio/Back/src/modules/schedules/` |
| Centers module | `/home/helio/Back/src/modules/centers/` |
| Documents module | `/home/helio/Back/src/modules/documents/` (to create) |
| Protocol module | `/home/helio/Back/src/modules/protocolo/` (to create) |

---

## Success Criteria

By end of MVP phase:
- Citizen can register and create account
- Citizen can view centers in their province
- Citizen can book BI appointment
- Citizen can upload required documents
- Citizen can check appointment status
- Center operator can see queue and update status
- Admin can generate reports (appointments/province/day)
- System supports all 24 provinces
- Zero lint errors, all tests pass
- Build deploys without errors  

---

**Last Updated:** February 28, 2026  
**Next Review:** After Week 1 completion
