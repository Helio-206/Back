# System Overview - Institutional Scheduling

## 1. System Goal

Centralized platform for managing schedules in public and private institutions. Citizens can book appointments in different centers (health, administrative, education) in a structured and auditable way.

## 2. Functional Scope

### 2.1 Core Modules

#### Auth
- User registration
- JWT login
- Refresh tokens
- Logout

#### Users
- Profile management
- Personal data view
- Account deactivation

#### Centers
- Center registration and management
- Working hours configuration
- Attendance days configuration
- Schedule visibility

#### Schedules
- Create, view, update, and cancel schedules
- Filter by center, date, or status
- Status confirmation flow
- Historical record

## 3. Scheduling Flow

```
Citizen Login
    |
Browse Centers
    |
Check Availability
    |
Create Schedule (Status: PENDING)
    |
Center Confirms (Status: CONFIRMED)
    |
Service Execution (IN_PROGRESS -> COMPLETED)
    |
History Stored
```

## 4. User Profiles

### 4.1 ADMIN
- Full system access
- Center management
- Full schedule visibility
- Reports and audits

### 4.2 CENTER
- Manage own center
- View center schedules
- Confirm or reject schedules
- Manage working hours

### 4.3 CITIZEN
- Create schedules
- View own schedules
- Cancel schedules
- Update profile

## 5. Data Structure

### Main Entities

**User**
- id, email, name, password, role, active, timestamps

**Center**
- id, name, type, address, phone, email
- openingTime, closingTime, attendanceDays
- userId (relation), active, timestamps

**Schedule**
- id, scheduledDate, slotNumber, description, status
- userId (citizen), centerId, timestamps

**RefreshToken**
- id, token, userId, expiresAt

### Enums

**Role**: ADMIN, CENTER, CITIZEN

**ScheduleStatus**: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED

**CenterType**: HEALTH, ADMINISTRATIVE, EDUCATION, SECURITY, OTHER

## 6. Business Rules

### 6.1 Schedules
- Citizens can only create schedules for future dates
- No duplicate schedules for same center and date
- Center can confirm or reject pending schedules
- Cancellation is not allowed for COMPLETED schedules

### 6.2 Centers
- Each center is linked to a user with role CENTER
- Hours must follow HH:MM format
- Centers can have multiple schedules

### 6.3 Security
- Citizens see only their own schedules
- Centers see only schedules for their center
- JWT validity: 24h
- Passwords hashed with bcrypt

## 7. Key API Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /users`
- `GET /centers`
- `POST /centers`
- `GET /schedules`
- `POST /schedules`
- `PUT /schedules/:id`
- `DELETE /schedules/:id/cancel`

## 8. Technologies

- NestJS
- PostgreSQL
- Prisma
- JWT + Passport
- class-validator
- bcrypt
- Jest
