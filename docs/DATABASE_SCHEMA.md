# Database Schema - Sistema de Agendamento Público de Angola

**Last Updated:** February 28, 2026  
**Database System:** PostgreSQL  
**ORM:** Prisma 5.6.0  
**Country:** Angola  
**Purpose:** Regularização e Emissão de Bilhete de Identidade (BI)

---

## Table of Contents

1. [Overview](#overview)
2. [Enums](#enums)
3. [Data Models](#data-models-detailed)
4. [Relationships](#relationships)
5. [BI Workflow](#bi-workflow)
6. [Database Indexes](#database-indexes)
7. [Key Constraints](#key-constraints)
8. [Migration Notes](#migration-notes)
9. [Team Responsibilities](#team-responsibilities)

---

## Overview

This database powers a complete **Bilhete de Identidade (BI) scheduling and management system for Angola**, covering:

- **Citizen Registration:** Citizens create accounts and provide biographic data
- **Document Upload:** Users attach required documents (RG, proof of residence, photos)
- **Scheduling:** Citizens book appointments at local BI issuing centers
- **Biometrics Collection:** Centers collect fingerprints and photos
- **Status Tracking:** Real-time tracking from scheduling to BI pickup
- **Protocol Management:** Full audit trail with receipt/protocol numbers
- **Provincial Coordination:** Separate centers per Angolan province

**Database Name:** sistema_bi_angola  
**Environment Variable:** DATABASE_URL (PostgreSQL connection string)  
**Scope:** All 24 Angolan provinces

---

## Enums

### 1. Role (User Authorization)

| Value | Description |
|-------|-------------|
| `ADMIN` | National system administrator (Ministry level) |
| `CENTER` | Provincial BI center manager/operator |
| `CITIZEN` | Regular citizen applying for/renewing BI |

---

### 2. TipoBI (BI Request Type)

| Value | Description | Requirements |
|-------|-------------|--------------|
| `NOVO` | New BI application | Birth certificate + RG + proof of residence |
| `RENOVACAO` | Renewal of expired BI | Old BI + residence proof |
| `PERDA` | Lost BI replacement | Police report + residence proof + RG |
| `EXTRAVIO` | Stolen BI replacement | Police report + residence proof + RG |
| `ATUALIZACAO_DADOS` | Data correction/update | Current BI + documents supporting change |

---

### 3. BIScheduleStatus (BI Application Lifecycle)

| Value | Description | Next Steps |
|-------|-------------|-----------|
| `AGENDADO` | Appointment scheduled | Citizen attends center on date |
| `CONFIRMADO` | Citizen confirmed attendance | Proceed to biometrics |
| `BIOMETRIA_RECOLHIDA` | Fingerprints & photos collected | Send to Ministry for processing |
| `EM_PROCESSAMENTO` | Ministry processing BI | ~15-30 days |
| `PRONTO_RETIRADA` | BI ready at center | Citizen notified to collect |
| `RETIRADO` | BI picked up by citizen | Process complete |
| `REJEITADO` | Application rejected | Documents incomplete or invalid |
| `CANCELADO` | Appointment/application cancelled | Can reschedule |

---

### 4. Provincia (Angolan Provinces)

All 24 provinces in enum form for data consistency:

```
BENGO, BENGUELA, BIES, CABINDA, CUANDO_CUBANGO,
CUANZA_NORTE, CUANZA_SUL, CUNENE, HUAMBO, HUILA,
KWANDO_KUBANGO, KWANZA_NORTE, KWANZA_SUL, LUANDA,
LUNDA_NORTE, LUNDA_SUL, MALANJE, MOXICO, NAMIBE,
UIGE, ZAI
```

---

### 5. DocumentType (Required Files)

| Value | Purpose | Format | Requirement |
|-------|---------|--------|-------------|
| `RG` | National registration card | PDF/JPEG | Mandatory |
| `CERTIDAO_NASCIMENTO` | Birth certificate | PDF/JPEG | Mandatory for NOVO |
| `COMPROVANTE_RESIDENCIA` | Proof of address | PDF/JPEG | Mandatory |
| `COMPROVANTE_ENDERECO` | Alternative address proof | PDF/JPEG | If no utility bill |
| `FOTO_3X4` | Biometric photo | JPEG | Mandatory |
| `OUTRO` | Other documents | Any | Optional notes |

---

## Data Models Detailed

### User (Extended for BI)

**Purpose:** Represents citizens, center operators, and administrators

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | CUID | No | auto | Unique identifier |
| `email` | String | No | - | Email (UNIQUE) |
| `name` | String | No | - | Full name |
| `password` | String | No | - | Hashed (bcrypt) |
| `role` | Role | No | CITIZEN | User type (ADMIN/CENTER/CITIZEN) |
| `active` | Boolean | No | true | Account active status |
| **BI-Specific:** | | | | |
| `dataNascimento` | DateTime | Yes | null | Date of birth |
| `provinciaNascimento` | Provincia | Yes | null | Birth province |
| `provinciaResidencia` | Provincia | Yes | null | Current residence |
| `numeroBIAnterior` | String | Yes | null | Previous BI number (for renewals) |
| `filiacao` | String | Yes | null | Parents' names |
| `genero` | String | Yes | null | Gender (M/F/Outro) |
| `createdAt` | DateTime | No | now() | Registration date |
| `updatedAt` | DateTime | No | now() | Last modification |

**Indexes:**
- `email` - Fast login lookup
- `role` - Filter by user type
- `provinciaResidencia` - Provincial statistics

**Relations:**
- One-to-One: `Center` (if CENTER role)
- One-to-Many: `Schedule`, `Document`, `Protocolo`, `RefreshToken`

---

### Center (Location for BI Issuance)

**Purpose:** BI issuing center in each province

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | CUID | No | auto | Unique identifier |
| `name` | String | No | - | Center name (e.g., "Centro de BI Luanda - Maianga") |
| `description` | String | Yes | null | Services offered |
| `type` | CenterType | No | - | Center classification |
| `provincia` | Provincia | No | - | **Which province** (critical field) |
| `address` | String | No | - | Full address |
| `phone` | String | Yes | null | Contact phone |
| `email` | String | Yes | null | Contact email |
| `openingTime` | String | No | "08:00" | Opening time (HH:mm) |
| `closingTime` | String | No | "17:00" | Closing time (HH:mm) |
| `attendanceDays` | String | No | "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY" | Available days |
| `capacidadeAgentos` | Int | No | 5 | Max agents per day |
| `active` | Boolean | No | true | Center operational |
| `createdAt` | DateTime | No | now() | Created date |
| `updatedAt` | DateTime | No | now() | Updated date |

**Indexes:**
- `userId` - Find center manager
- `provincia` - Provincial queries

**Relations:**
- One-to-One: `User` (manager, CASCADE delete)
- One-to-Many: `Schedule`

---

### Schedule (BI Appointment)

**Purpose:** Citizen appointment for BI application/renewal

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | CUID | No | auto | Unique identifier |
| `userId` | String | No | - | Citizen booking (FK) |
| `centerId` | String | No | - | Center location (FK) |
| `scheduledDate` | DateTime | No | - | **Appointment date & time** |
| `slotNumber` | Int | Yes | null | Queue position (1-N) |
| `description` | String | Yes | null | Citizen notes |
| **Status Tracking:** | | | | |
| `status` | ScheduleStatus | No | PENDING | Generic status (legacy) |
| `tipoBI` | TipoBI | Yes | null | **BI type (NOVO/RENOVACAO/PERDA/EXTRAVIO/UPDATE)** |
| `biStatus` | BIScheduleStatus | No | AGENDADO | **BI-specific status** |
| `dataRetirada` | DateTime | Yes | null | When citizen picked up BI |
| `nbiEmitido` | String | Yes | null | Issued BI number (auto-generated) |
| `notes` | String | Yes | null | Center operator notes (rejection reason, etc) |
| `createdAt` | DateTime | No | now() | Scheduled date |
| `updatedAt` | DateTime | No | now() | Last status change |

**Indexes:**
- `userId` - Citizen's appointments
- `centerId` - Center's queue
- `status` & `biStatus` - Filter by state
- `scheduledDate` - Date range queries

**Relations:**
- Many-to-One: `User` (FK → citizen, CASCADE delete)
- Many-to-One: `Center` (FK → location, CASCADE delete)
- One-to-Many: `Document` (attached files)
- One-to-One: `Protocolo` (receipt/tracking)

---

### Document (Uploaded Files)

**Purpose:** Store references to citizen-uploaded documents

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | CUID | No | auto | Unique identifier |
| `fileName` | String | No | - | Original file name from upload |
| `fileUrl` | String | No | - | **URL to access file** (S3/storage) |
| `fileSize` | Int | Yes | null | File size in bytes |
| `filePath` | String | Yes | null | Local storage path (if on-premise) |
| `mimeType` | String | Yes | null | File type (application/pdf, image/jpeg) |
| `documentType` | DocumentType | No | - | **RG / CERTIDAO / COMPROVANTE_RESIDENCIA** |
| `userId` | String | No | - | Uploader (FK) |
| `scheduleId` | String | No | - | Associated appointment (FK) |
| `uploadedAt` | DateTime | No | now() | Upload timestamp |

**Indexes:**
- `userId` - Citizen's documents
- `scheduleId` - Appointment's documents
- `documentType` - Find specific documents

**Relations:**
- Many-to-One: `User` (FK, CASCADE delete)
- Many-to-One: `Schedule` (FK, CASCADE delete)

---

### Protocolo (Receipt & Tracking)

**Purpose:** Audit trail and receipt for each BI application

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | CUID | No | auto | Unique ID |
| `numeroProtocolo` | String | No | UNIQUE | **Citizen receipt number** (format: BI-YYYY-MM-XXXXX) |
| `scheduleId` | String | No | UNIQUE | Associated appointment (FK) |
| `statusAnterior` | BIScheduleStatus | No | - | Previous status |
| `statusAtual` | BIScheduleStatus | No | - | Current status |
| `agenteProcessador` | String | Yes | null | Admin/Center user who updated |
| `observacoes` | String | Yes | null | Notes on status change |
| `registradoEm` | DateTime | No | now() | When scheduled |
| `processadoEm` | DateTime | Yes | null | When processed (status updated) |
| `createdAt` | DateTime | No | now() | Record creation |

**Indexes:**
- `numeroProtocolo` - Citizen lookup by receipt
- `scheduleId` - Find protocol for appointment

**Relations:**
- One-to-One: `Schedule` (FK, CASCADE delete)

**Example Protocol Number:** `BI-2026-02-00001` (BI-Year-Month-Sequential)

---

### RefreshToken (Session Management)

**Purpose:** JWT refresh token storage for extended sessions

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | CUID | No | auto | Token ID |
| `token` | String | No | UNIQUE | JWT refresh token |
| `userId` | String | No | - | Token owner (FK) |
| `expiresAt` | DateTime | No | - | Expiration timestamp |
| `createdAt` | DateTime | No | now() | Creation time |

**Default TTL:** 24 hours

---

## Relationships

```
User (1) ──────── (1..1) Center
  │                  └─ "manages"
  │
  ├─ (1) ────────── (0..*) Schedule
  │                   └─ "applies for"
  │
  ├─ (1) ────────── (0..*) Document
  │                   └─ "uploads"
  │
  ├─ (1) ────────── (0..*) Protocolo
  │                   └─ "referenced in"
  │
  └─ (1) ────────── (0..*) RefreshToken
                       └─ "owns"

Center (1) ────────────── (0..*) Schedule
                            └─ "hosts appointments"

Schedule (1) ────────────── (0..*) Document
               └─ "contains"

Schedule (1) ────────────── (1) Protocolo
               └─ "tracked by"
```

---

## BI Workflow

### Complete Appointment Lifecycle

```
1. CITIZEN REGISTRATION
   └─ User creates account
   └─ Provides: dataNascimento, provinciaResidencia, genero, etc
   
2. DOCUMENT UPLOAD
   └─ Uploads: RG, Certidão de Nascimento, Comprovante de Residência, Foto 3x4
   └─ Documents stored in `Document` table (with fileUrl pointing to storage)

3. APPOINTMENT BOOKING
   └─ SELECT Center by provincia
   └─ View available slots (based on capacidadeAgentos & attendanceDays)
   └─ CREATE Schedule with:
      ├─ scheduledDate (citizen's preferred time)
      ├─ tipoBI (NOVO, RENOVACAO, etc)
      ├─ centerId (provincial center)
      └─ biStatus = AGENDADO
   └─ GENERATE Protocolo with numeroProtocolo (BI-2026-02-00001)

4. APPOINTMENT DAY
   └─ Schedule.biStatus = CONFIRMADO (when citizen arrives)
   └─ Create/Update Protocolo with notes

5. BIOMETRICS COLLECTION
   └─ Center agent collects fingerprints & photos
   └─ Schedule.biStatus = BIOMETRIA_RECOLHIDA
   └─ Upload raw biometric files to Document table

6. MINISTRY PROCESSING
   └─ Ministry receives biometric data
   └─ Processes application (~15-30 days)
   └─ Schedule.biStatus = EM_PROCESSAMENTO

7. BI READY
   └─ Ministry issues BI number
   └─ Update: Schedule.nbiEmitido = "BI123456789"
   └─ Schedule.biStatus = PRONTO_RETIRADA
   └─ Notify citizen (Email/SMS)

8. PICKUP
   └─ Citizen collects BI at center
   └─ Schedule.dataRetirada = now()
   └─ Schedule.biStatus = RETIRADO
   └─ Protocolo complete

EDGE CASES:
─ REJEITADO: If docs incomplete, update Schedule.biStatus + Schedule.notes
─ CANCELADO: Citizen cancels appointment, can reschedule
```

---

## Database Indexes

### Performance Optimization

| Table | Columns | Purpose | Query Example |
|-------|---------|---------|----------------|
| `User` | `email` | Login lookup | Find user by email |
| `User` | `role` | Filter by type | Get all CENTER operators |
| `User` | `provinciaResidencia` | Statistics | Count citizens per province |
| `Center` | `userId` | Find manager | Which center does this user manage? |
| `Center` | `provincia` | Provincial queries | All centers in Luanda |
| `Schedule` | `userId` | Citizen's appointments | Show my 5 appointments |
| `Schedule` | `centerId` | Center's queue | Queue for Luanda center today |
| `Schedule` | `biStatus` | Filter by state | Show all PRONTO_RETIRADA |
| `Schedule` | `scheduledDate` | Date ranges | Appointments next 7 days |
| `Schedule` | `tipoBI` | By type | Count renewals vs new |
| `Document` | `userId` | Citizen's files | What docs did citizen upload? |
| `Document` | `scheduleId` | Appointment docs | Docs required, submitted |
| `Document` | `documentType` | By category | All birth certificates |
| `Protocolo` | `numeroProtocolo` | Citizen receipt lookup | Find via receipt number |
| `Protocolo` | `scheduleId` | Status history | Full audit trail |

---

## Key Constraints

### Data Integrity Rules

1. **Email Uniqueness**
   - One email = one account
   - Database enforces via UNIQUE

2. **Center-User Relationship**
   - Each CENTER-role user manages exactly one center
   - Database enforces via UNIQUE foreignKey

3. **Cascade Deletes**
   - Delete User → Delete Center, Schedules, Documents, Protocolos
   - Delete Schedule → Delete Documents (not reverse)

4. **BI Status Progression**
   - AGENDADO → CONFIRMADO → BIOMETRIA_RECOLHIDA → EM_PROCESSAMENTO → PRONTO_RETIRADA → RETIRADO
   - Or any → REJEITADO / CANCELADO
   - **Application enforces** (DB allows any)

5. **Document Requirements**
   ```
   TipoBI = NOVO requires:
     ✓ CERTIDAO_NASCIMENTO
     ✓ COMPROVANTE_RESIDENCIA
     ✓ FOTO_3X4
     ✓ RG
     
   TipoBI = RENOVACAO requires:
     ✓ COMPROVANTE_RESIDENCIA
     ✓ FOTO_3X4
   ```
   **Application enforces** (DB allows flexibility)

6. **Date Constraints**
   - `scheduledDate` must be >= today + 1 day
   - `scheduledDate` must align with Center's `attendanceDays`
   - `scheduledDate` must be between `openingTime` and `closingTime`
   - **Application enforces**

---

## Migration Notes

### First Time Setup

```bash
# 1. Set environment variable
export DATABASE_URL="postgresql://user:pass@localhost:5432/sistema_bi_angola"

# 2. Run migrations
npx prisma migrate deploy

# 3. Generate Prisma Client
npx prisma generate

# 4. (Optional) Seed test data
npx prisma db seed
```

### Updating Schema

```bash
# After modifying schema.prisma:
npx prisma migrate dev --name [descriptive_name]
# e.g.: npx prisma migrate dev --name add_bi_fields_to_user
# e.g.: npx prisma migrate dev --name create_document_table
```

### Backup Before Major Changes

```bash
# PostgreSQL backup
pg_dump sistema_bi_angola > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore:
psql -d sistema_bi_angola < backup_20260228_143000.sql
```

---

## Team Responsibilities

### Database Team (DBA)

**Setup & Maintenance:**
- PostgreSQL installation and configuration
- Create `sistema_bi_angola` database
- Run initial migrations (`npx prisma migrate deploy`)
- Set up daily backups
- Monitor indexes for performance
- Plan capacity for 24 provinces and citizens (~100K users/month projected)

**Monitoring:**
```sql
-- Monitor slow queries
SELECT query, calls, mean_exec_time FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes ORDER BY idx_scan DESC;

-- Count records
SELECT COUNT(*) FROM "User";       -- Expect: 100K+
SELECT COUNT(*) FROM "Schedule";  -- Expect: 500K+
SELECT COUNT(*) FROM "Document";  -- Expect: 1M+
```

**Alert Thresholds:**
- DB size > 50GB (investigate)
- Query time > 1s (optimize)
- Failed backups (critical)

---

### Backend Development Team (Cleusio)

**Implementation Tasks:**
- Create DTOs for all models (UserCreateDto, ScheduleCreateDto, etc)
- Implement PrismaService queries
- Build REST endpoints:
  ```
  POST   /auth/register           -- Create citizen account
  POST   /schedules               -- Book appointment
  GET    /schedules/:id           -- View appointment
  PUT    /schedules/:id           -- Update appointment
  POST   /documents               -- Upload document
  GET    /documents?scheduleId    -- List docs
  GET    /protocolo/:numeroProtocolo -- Lookup receipt
  ```
- Add validators (TipoBI validation, date checks, doc requirements)
- Error handling (friendly messages for DB errors)
- Pagination for large queries (schedules, documents)
- Authentication and Authorization (JWT, roles)

**Key Backend Features Needed:**
1. **Document Upload Handler**
   - Validate file size (max 5MB)
   - Scan for viruses
   - Upload to S3 or local storage
   - Store reference in `Document.fileUrl`

2. **Protocol Number Generator**
   - Format: `BI-YYYY-MM-XXXXX`
   - Sequential per month per province
   - Unique constraint enforced

3. **Status Transition Logic**
   - Only CENTER/ADMIN can move status forward
   - Reject if documents incomplete
   - Notify citizen on key transitions

4. **Notification Service** (Future)
   - Email when BI ready (PRONTO_RETIRADA)
   - SMS reminders
   - Rejection notices

5. **Reporting Queries**
   - Appointments per province per day
   - Pending vs completed
   - Average processing time

---

## Example Queries for Team Reference

### DBA: Create Initial Data

```sql
-- Province counts
SELECT provincia, COUNT(*) FROM "Center" GROUP BY provincia;

-- Busiest centers
SELECT c.name, COUNT(s.id) as appointments
FROM "Center" c
LEFT JOIN "Schedule" s ON c.id = s."centerId"
GROUP BY c.id, c.name
ORDER BY appointments DESC;

-- Document completion rate
SELECT 
  COUNT(DISTINCT s.id) as total_schedules,
  COUNT(DISTINCT CASE WHEN d.id IS NOT NULL THEN s.id END) as with_docs
FROM "Schedule" s
LEFT JOIN "Document" d ON s.id = d."scheduleId"
WHERE s."biStatus" IN ('AGENDADO', 'CONFIRMADO');
```

### Backend: Find Appointments by Type

```typescript
// Find all NOVO applications pending processing
const newBIs = await prisma.schedule.findMany({
  where: {
    tipoBI: 'NOVO',
    biStatus: 'EM_PROCESSAMENTO',
  },
  include: {
    user: true,
    center: true,
    documents: true,
  },
});

// Count by province
const byProvince = await prisma.center.groupBy({
  by: ['provincia'],
  _count: {
    schedules: true,
  },
});
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2026-02-28 | **MVP Release**: Add BI-specific models (Document, Protocolo), extend User/Schedule/Center with BI fields |
| 1.0 | 2026-02-25 | Initial schema: Generic scheduling system |

---

**Document prepared for:** Database Team, Backend Team (Cleusio), DevOps  
**Status:** Production Ready for MVP Phase  
**Jurisdiction:** Angola (24 Provinces)  
**Last Reviewed:** February 28, 2026

---

## Overview

This document describes the complete database structure for the Angolan Public Scheduling System. The database manages appointment scheduling across government institutions, healthcare facilities, and administrative services throughout Angola.

- **User Management:** System administrators, center managers, and Angolan citizens
- **Center Management:** Registration and administration of public service centers (healthcare, administrative, educational)
- **Schedule Management:** Citizens can book appointments at government and institutional centers
- **Authentication:** JWT token refresh mechanism with 24-hour validity

**Database Name:** sistema_agendamento_angola  
**Environment Variable:** DATABASE_URL (PostgreSQL connection string)  
**Supported Provinces:** All Angolan provinces and municipalities

---

## Enums

### 1. Role

User role enum defining authorization levels in the system.

| Value | Description |
|-------|-------------|
| `ADMIN` | System administrator with full access |
| `CENTER` | Center manager with center-specific access |
| `CITIZEN` | Regular citizen who can book schedules |

**Default Value:** `CITIZEN`

---

### 2. ScheduleStatus

Status lifecycle of a schedule/appointment.

| Value | Description |
|-------|-------------|
| `PENDING` | Schedule created but not yet confirmed |
| `CONFIRMED` | Schedule confirmed by center |
| `IN_PROGRESS` | Schedule is currently being attended |
| `COMPLETED` | Schedule successfully completed |
| `CANCELLED` | Schedule cancelled by user or center |

**Default Value:** `PENDING`

---

### 3. CenterType

Classification type for service centers.

| Value | Description |
|-------|-------------|
| `HEALTH` | Healthcare facilities (hospitals, clinics, health centers, pharmacies, diagnostic labs) |
| `ADMINISTRATIVE` | Government services (Ministry offices, provincial government, civil registry, immigration, taxation) |
| `EDUCATION` | Educational institutions (public universities, technical schools, vocational training centers) |
| `SECURITY` | Security services (police stations, fire departments, border control) |
| `OTHER` | Other institutional services |

---

## Data Models

### User

Represents system users: administrators, center managers, and citizens.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | Unique user identifier |
| `email` | String | UNIQUE, NOT NULL | User email address |
| `name` | String | NOT NULL | Full user name |
| `password` | String | NOT NULL | Hashed password (bcrypt) |
| `role` | Role | DEFAULT: CITIZEN | User authorization role |
| `active` | Boolean | DEFAULT: true | Account active status |
| `createdAt` | DateTime | NOT NULL | Record creation timestamp |
| `updatedAt` | DateTime | NOT NULL | Last modification timestamp |

**Relations:**
- One-to-One with `Center` (optional, user may not manage a center)
- One-to-Many with `Schedule` (user can have multiple schedules)
- One-to-Many with `RefreshToken` (user can have multiple tokens)

**Indexes:**
- `email` - For quick user lookup by email
- `role` - For filtering users by role

**Notes:**
- Password must be hashed using bcrypt (minimum 10 salt rounds)
- Email must be unique across the system
- Users are soft-deleted by setting `active = false`

---

### Center

Represents a public service center.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | Unique center identifier |
| `name` | String | NOT NULL | Center name |
| `description` | String | NULLABLE | Center description and services |
| `type` | CenterType | NOT NULL | Center type classification |
| `address` | String | NOT NULL | Full address |
| `phone` | String | NULLABLE | Contact phone number |
| `email` | String | NULLABLE | Contact email address |
| `openingTime` | String | DEFAULT: "08:00" | Opening time (HH:mm format) |
| `closingTime` | String | DEFAULT: "17:00" | Closing time (HH:mm format) |
| `attendanceDays` | String | DEFAULT: "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY" | Days available (comma-separated) |
| `active` | Boolean | DEFAULT: true | Center active status |
| `createdAt` | DateTime | NOT NULL | Record creation timestamp |
| `updatedAt` | DateTime | NOT NULL | Last modification timestamp |
| `userId` | String | FOREIGN KEY, UNIQUE | Reference to managing user (CENTER role) |

**Relations:**
- One-to-One with `User` (via `userId`, CASCADE delete)
- One-to-Many with `Schedule` (center has multiple schedules)

**Indexes:**
- `userId` - For finding center by manager

**Notes:**
- Each center is managed by exactly one user (CENTER role)
- Deleting user automatically deletes associated center
- Time format is 24-hour (HH:mm)
- Attendance days format: "MONDAY,TUESDAY,..." or similar enumeration

---

### Schedule

Represents a scheduled appointment between citizen and center.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | Unique schedule identifier |
| `scheduledDate` | DateTime | NOT NULL | Date and time of appointment |
| `slotNumber` | Int | NULLABLE | Appointment slot number |
| `description` | String | NULLABLE | Appointment description/reason |
| `status` | ScheduleStatus | DEFAULT: PENDING | Current status of schedule |
| `notes` | String | NULLABLE | Additional notes (center or admin) |
| `createdAt` | DateTime | NOT NULL | Record creation timestamp |
| `updatedAt` | DateTime | NOT NULL | Last modification timestamp |
| `userId` | String | FOREIGN KEY, NOT NULL | Reference to booking citizen |
| `centerId` | String | FOREIGN KEY, NOT NULL | Reference to center |

**Relations:**
- Many-to-One with `User` (via `userId`, CASCADE delete)
- Many-to-One with `Center` (via `centerId`, CASCADE delete)

**Indexes:**
- `userId` - For finding schedules by user
- `centerId` - For finding schedules by center
- `status` - For filtering by schedule status
- `scheduledDate` - For date range queries

**Notes:**
- Deleting either user or center automatically deletes associated schedules
- Status progression: PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
- Alternative path: Any status → CANCELLED
- Slot number is optional for centers without slot-based scheduling

---

### RefreshToken

Stores JWT refresh tokens for session management.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | Unique token identifier |
| `token` | String | UNIQUE, NOT NULL | The actual JWT token |
| `userId` | String | FOREIGN KEY, NOT NULL | Reference to token owner |
| `expiresAt` | DateTime | NOT NULL | Token expiration timestamp |
| `createdAt` | DateTime | NOT NULL | Token creation timestamp |

**Relations:**
- Many-to-One with `User` (via `userId`, CASCADE delete)

**Indexes:**
- `userId` - For finding tokens by user

**Notes:**
- Token is revoked if `expiresAt` is in the past
- Deleting user automatically deletes all their refresh tokens
- Default token validity: 24 hours from creation

---

## Relationships

### User → Center (One-to-One, Optional)

A user may manage a center. Only users with `CENTER` role have an associated center.

```
User (1) ──────── (0..1) Center
         manages
```

- **Cascade Rule:** DELETE user → DELETE center
- **Foreign Key:** Center.userId → User.id

### User → Schedule (One-to-Many)

A user can have multiple schedules (appointments).

```
User (1) ──────── (0..*) Schedule
         books
```

- **Cascade Rule:** DELETE user → DELETE schedules
- **Foreign Key:** Schedule.userId → User.id

### Center → Schedule (One-to-Many)

A center has multiple schedules (appointments).

```
Center (1) ──────── (0..*) Schedule
           hosts
```

- **Cascade Rule:** DELETE center → DELETE schedules
- **Foreign Key:** Schedule.centerId → Center.id

### User → RefreshToken (One-to-Many)

A user can have multiple refresh tokens (for different sessions/devices).

```
User (1) ──────── (0..*) RefreshToken
         owns
```

- **Cascade Rule:** DELETE user → DELETE tokens
- **Foreign Key:** RefreshToken.userId → User.id

---

## Indexes

### Performance Indexes

| Table | Column(s) | Purpose |
|-------|-----------|---------|
| `User` | `email` | Fast user lookup by email during login |
| `User` | `role` | Quick filtering of users by role |
| `Center` | `userId` | Finding center managed by specific user |
| `Schedule` | `userId` | Listing user's schedules |
| `Schedule` | `centerId` | Listing center's schedules |
| `Schedule` | `status` | Filtering schedules by status |
| `Schedule` | `scheduledDate` | Date range queries |
| `RefreshToken` | `userId` | Finding tokens for specific user |

### Primary Keys (Implicit Indexes)

- `User.id` (CUID)
- `Center.id` (CUID)
- `Schedule.id` (CUID)
- `RefreshToken.id` (CUID)

### Unique Constraints

- `User.email` - Only one account per email
- `Center.userId` - Each user manages at most one center
- `RefreshToken.token` - Each token is unique

---

## Data Types Reference

| Prisma Type | PostgreSQL Type | Description |
|-------------|-----------------|-------------|
| String | VARCHAR(255) | Variable-length text |
| DateTime | TIMESTAMP WITH TIME ZONE | Date and time |
| Int | INTEGER | Whole numbers |
| Boolean | BOOLEAN | True/False values |
| Enum | VARCHAR | Enum values stored as strings |

**CUID:** Collision-resistant IDs (25-character random strings), generated by `@default(cuid())`

---

## Entity Relationship Diagram

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ name                │
│ password            │
│ role (ENUM)         │
│ active              │
│ createdAt           │
│ updatedAt           │
└─────────────────────┘
         │1
         │
         ├─ 1:1 ──→ ┌─────────────────────┐
         │          │      Center         │
         │          ├─────────────────────┤
         │          │ id (PK)             │
         │          │ name                │
         │          │ description         │
         │          │ type (ENUM)         │
         │          │ address             │
         │          │ phone               │
         │          │ email               │
         │          │ openingTime         │
         │          │ closingTime         │
         │          │ attendanceDays      │
         │          │ active              │
         │          │ userId (FK)         │
         │          │ createdAt           │
         │          │ updatedAt           │
         │          └─────────────────────┘
         │                   │1
         │                   │
         │                   ├─ 1:* ──→ ┌──────────────────────┐
         │                   │          │     Schedule         │
         │          ┌────────┘          ├──────────────────────┤
         │          │                   │ id (PK)              │
         ├─ 1:* ───┤                    │ scheduledDate        │
         │          │                   │ slotNumber           │
         │          │                   │ description          │
         │          └────→ Schedule ─────│ status (ENUM)        │
         │             ↑                 │ notes                │
         │             │                 │ userId (FK)          │
         │             │                 │ centerId (FK)        │
         │             │                 │ createdAt            │
         │             │                 │ updatedAt            │
         │             │                 └──────────────────────┘
         │             └─────────────────────┘
         │
         ├─ 1:* ──→ ┌──────────────────────┐
         │          │   RefreshToken       │
         │          ├──────────────────────┤
         │          │ id (PK)              │
         │          │ token (UNIQUE)       │
         │          │ userId (FK)          │
         │          │ expiresAt            │
         │          │ createdAt            │
         │          └──────────────────────┘
         │
         └─────────────────────────────────
```

---

## Constraints & Rules

### Functional Constraints

1. **User Email Uniqueness**
   - No two users can have the same email
   - Database enforces via UNIQUE constraint

2. **Center-User One-to-One**
   - Each center is managed by exactly one user
   - Each CENTER-role user manages at most one center
   - Database enforces via UNIQUE constraint on Center.userId

3. **Cascade Deletes**
   - Deleting a user deletes all their associated data:
     - Center (if user is CENTER role)
     - Schedules (as citizen)
     - Refresh tokens
   - Deleting a center deletes all its schedules

4. **Status Progression**
   - Schedule status should follow this progression:
     - PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
     - Any status → CANCELLED (exception)
   - Application-level enforcement required (database allows any transition)

5. **Schedule Date Validation**
   - `scheduledDate` should be in the future
   - `scheduledDate` should align with center's `attendanceDays`
   - `scheduledDate` should be within center's `openingTime` and `closingTime`
   - Application-level enforcement required

6. **Token Expiration**
   - Tokens are considered valid only if `expiresAt > NOW()`
   - Cleanup of expired tokens is application responsibility

### Data Integrity Rules

| Rule | Enforcement |
|------|-------------|
| Email uniqueness | Database UNIQUE constraint |
| Required fields | Database NOT NULL constraints |
| Cascade deletes | Database CASCADE rules |
| Foreign key references | Database FOREIGN KEY constraints |
| Status values | Database ENUM type |
| Role values | Database ENUM type |
| Center type values | Database ENUM type |

### Recommended Maintenance

1. **Periodic Token Cleanup**
   ```sql
   DELETE FROM "RefreshToken" WHERE "expiresAt" < NOW();
   ```

2. **User Deactivation Instead of Deletion**
   - Set `active = false` instead of deleting users for audit trail
   - Implement soft-delete pattern at application level

3. **Index Monitoring**
   - Monitor query performance on Schedule table (largest expected table)
   - Consider additional composite indexes if date range queries become slow

4. **Backup Strategy**
   - Regular PostgreSQL backups recommended
   - Test restore procedures regularly

---

## Migration & Deployment Notes

### Database Creation

The database is created and managed by Prisma migrations:

```bash
npx prisma migrate deploy   # Apply pending migrations
npx prisma db push         # Push current schema to database
npx prisma generate        # Generate Prisma Client
```

### Initial Data Seeding

Run the seed script to populate test data:

```bash
npx prisma db seed
```

Default test users created:
- **Email:** admin@agendamento.ao (System Administrator)
- **Email:** centro@agendamento.ao (Center Manager)

### Environment Setup

Required PostgreSQL connection string format:

```
postgresql://username:password@host:port/database_name?schema=public
```

Set in `.env` file:

```
DATABASE_URL="postgresql://user:pass@localhost:5432/sistema_agendamento_angola"
```

---

## Version Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-25 | Initial database schema documentation for Angolan Public Scheduling System |

---

**Document Prepared For:** Database Team - Sistema de Agendamento de Angola  
**Prepared By:** Backend Development Team  
**Status:** Production Ready  
**Jurisdiction:** Angola  
**Last Review:** February 25, 2026
