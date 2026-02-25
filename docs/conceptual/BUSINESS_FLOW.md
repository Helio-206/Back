# Business Flow - Scheduling System

## 1. Use Case: Citizen Scheduling

### Preconditions
- Citizen is authenticated
- Center exists and is active
- Scheduled date is in the future
- Center has availability

### Main Flow

```
1) CITIZEN BROWSES CENTERS
   GET /centers
   -> Returns active centers

2) CITIZEN CHECKS SCHEDULES
   GET /schedules?centerId=xyz
   -> Citizen finds an available slot

3) CITIZEN CREATES SCHEDULE
   POST /schedules
   Body: {
     centerId: "xyz",
     scheduledDate: "2024-03-01T10:00:00Z",
     description: "Medical appointment"
   }
   -> Status = PENDING

4) CENTER REVIEWS PENDING SCHEDULE
   -> Center can confirm or reject

5) CENTER CONFIRMS
   PUT /schedules/:id
   Body: { status: "CONFIRMED" }

6) SERVICE DAY
   Status progresses to IN_PROGRESS then COMPLETED
```

### Alternative Flow: Cancellation

```
CITIZEN REQUESTS CANCELLATION
   DELETE /schedules/:id/cancel
   -> Status = CANCELLED
   -> History preserved
```

## 2. Use Case: Center Management

### Create Center

```
1) CENTER USER LOGS IN
   POST /auth/login

2) CENTER USER CREATES CENTER
   POST /centers (JWT required)
   Body: {
     name: "Primary Health Center",
     type: "HEALTH",
     address: "Main Street, 123",
     openingTime: "08:00",
     closingTime: "18:00",
     attendanceDays: "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY"
   }

3) CENTER VIEWS DASHBOARD
   GET /centers/:id
```

### Manage Center Schedules

```
GET /schedules?centerId=xyz
PUT /schedules/:id { status: "CONFIRMED" }
PUT /schedules/:id { status: "IN_PROGRESS" }
PUT /schedules/:id { status: "COMPLETED" }
```

## 3. Use Case: Admin Supervision

```
ADMIN FULL ACCESS:
- GET /users
- GET /centers
- GET /schedules
- Can update or delete any resource
```

## 4. Implemented Business Rules

### Schedules
| Rule | Implementation |
|------|----------------|
| No duplicate schedule | Service validation |
| Future date only | DTO validation |
| Citizen cannot edit after confirmation | Guard + service check |
| Center capacity limit | Planned validation |

### Data Security
| Aspect | Implementation |
|--------|----------------|
| Passwords | bcrypt (10 rounds) |
| JWT | 24h validity |
| RBAC | Guards + decorators |
| SQL Injection | Prisma prepared statements |
| Sensitive data | Never return password |

## 5. Schedule State Diagram

```
PENDING -> CONFIRMED -> IN_PROGRESS -> COMPLETED
   |           |             |
   +-----------+-------------+-> CANCELLED
```

## 6. Role Permissions

| Action | ADMIN | CENTER | CITIZEN |
|--------|-------|--------|---------|
| View all users | Yes | No | No |
| View all centers | Yes | Yes | Yes |
| Create center | No | Yes | No |
| Edit own center | Yes | Yes | No |
| Create schedule | No | No | Yes |
| View own schedules | Yes | Yes | Yes |
| View center schedules | Yes | Yes | No |
| Confirm schedule | Yes | Yes | No |
| Delete schedule | Yes | No | Yes |
