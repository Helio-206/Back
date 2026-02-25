# Database Schema - Institutional Scheduling Backend

**Last Updated:** February 25, 2026  
**Database System:** PostgreSQL  
**ORM:** Prisma 5.6.0

---

## Table of Contents

1. [Overview](#overview)
2. [Enums](#enums)
3. [Data Models](#data-models)
4. [Relationships](#relationships)
5. [Indexes](#indexes)
6. [Data Types Reference](#data-types-reference)
7. [Entity Relationship Diagram](#entity-relationship-diagram)
8. [Constraints & Rules](#constraints--rules)

---

## Overview

This document describes the complete database structure for the Institutional Scheduling Backend system. The database is designed to manage:

- **User Management:** Administrative users, center managers, and citizens
- **Center Management:** Registration and administration of public service centers
- **Schedule Management:** Scheduling system for citizens to book appointments at centers
- **Authentication:** JWT token refresh mechanism with expiration tracking

**Database Name:** institutional_scheduling  
**Environment Variable:** DATABASE_URL (PostgreSQL connection string)

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
| `HEALTH` | Health care centers (clinics, hospitals, health posts) |
| `ADMINISTRATIVE` | Administrative services (government offices, registry) |
| `EDUCATION` | Educational institutions (schools, universities) |
| `SECURITY` | Security services (police, fire departments) |
| `OTHER` | Other types of service centers |

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
- **Email:** admin@schedule.local
- **Email:** center@schedule.local

### Environment Setup

Required PostgreSQL connection string format:

```
postgresql://username:password@host:port/database_name?schema=public
```

Set in `.env` file:

```
DATABASE_URL="postgresql://user:pass@localhost:5432/institutional_scheduling"
```

---

## Version Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-25 | Initial database schema documentation |

---

**Document Prepared For:** Database Team  
**Prepared By:** Backend Development Team  
**Status:** Production Ready  
**Last Review:** February 25, 2026
