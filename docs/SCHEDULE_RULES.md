# Business Rules - Scheduling

## Overview

This document defines the business rules for the Scheduling module in the Institutional Scheduling Backend.

## Functional Rules

### FR-001: Future Scheduling Only
**Description**: Citizens can schedule only for future dates.

**Implementation**:
- Custom validator `@IsFutureDate()` on CreateScheduleDto
- Service validates: `scheduledDate > now()`
- Throws: `BadRequestException` if date is in the past

**Exception**: ADMIN can create backdated schedules when required (future enhancement).

### FR-002: No Duplicate Schedule in Same Center and Date
**Description**: A citizen cannot have more than one schedule in the same center on the same date.

**Validation Logic**:
```typescript
const existing = await this.prisma.schedule.findFirst({
  where: {
    userId,
    centerId: createDto.centerId,
    scheduledDate: createDto.scheduledDate,
    status: { in: ['PENDING', 'CONFIRMED'] },
  },
});

if (existing) {
  throw new ConflictException(
    'You already have a schedule for this center on this date'
  );
}
```

### FR-003: Schedule Lifecycle and Status Transitions
**Description**: Valid states and allowed transitions.

**States**:
- `PENDING`: Created, waiting for center confirmation
- `CONFIRMED`: Center confirmed the schedule
- `IN_PROGRESS`: Service is being provided
- `COMPLETED`: Service completed successfully
- `CANCELLED`: Cancelled by citizen, center, or admin

**Allowed Transitions**:
```
PENDING ──────────┐
  │               ├──> CONFIRMED ──────┐
  │               │                     ├──> IN_PROGRESS ──────┐
  │               │                     │                      ├──> COMPLETED
  │               │                     │                      │
  └───────────────┴─────────────────────┴──────────────────────┘
                                        │
                                        V
                                    CANCELLED
```

**Rules**:
- Once `COMPLETED`, status is immutable (no further updates)
- `CANCELLED` is a terminal state
- Direct jumps (e.g., PENDING -> COMPLETED) are not allowed

### FR-004: Schedule Cancellation
**Description**: Schedules can be cancelled before completion.

**Who can cancel**:
- Citizen can cancel own schedules
- Center can cancel its schedules (future RBAC implementation)
- Admin can cancel any schedule (future RBAC implementation)

**Validation**:
- Cannot cancel if status is `COMPLETED`
- Can cancel from any of: `PENDING`, `CONFIRMED`, `IN_PROGRESS`
- Cancellation results in `CANCELLED` status

### FR-005: Center Must Exist and Be Active
**Description**: Scheduling is not allowed in non-existent centers.

**Validation Logic**:
```typescript
const center = await this.prisma.center.findUnique({
  where: { id: createDto.centerId },
});

if (!center) {
  throw new NotFoundException(
    `Center with ID ${createDto.centerId} not found`
  );
}
```

### FR-006: Schedule Visibility (Future RBAC)
**Description**: Each role sees only authorized schedules.

**CITIZEN** (future implementation):
- Can view only own schedules
- Endpoint: `GET /schedules/user/me`

**CENTER** (future implementation):
- Can view schedules of its center
- Endpoint: `GET /schedules?centerId=xyz`

**ADMIN** (future implementation):
- Can view all schedules
- Endpoint: `GET /schedules`

### FR-007: Business Hours Validation (Future)
**Description**: Validate schedule times within center business hours.

**Will Implement**:
- Check `center.openingTime` and `center.closingTime`
- Check `center.attendanceDays` for weekday matching
- Validate `scheduledDate` falls within operating hours

## Data Rules

### DR-001: Required Fields
- `centerId`: required (UUID reference to Center)
- `scheduledDate`: required (ISO 8601 datetime format)
- `userId`: required (set by system from authenticated user)

### DR-002: Optional Fields
- `slotNumber`: optional (positive integer, 1-based indexing)
- `description`: optional (string, max 500 chars)
- `notes`: optional (string, max 1000 chars)
- `status`: optional (defaults to `PENDING`)

### DR-003: Field Constraints
- `scheduledDate`: Must match ISO 8601 format (e.g., `2026-03-05T10:00:00Z`)
- `slotNumber`: Positive integer >= 1 if provided
- `status`: One of: `PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

## API Endpoints

### POST /schedules
**Authentication**: Required (JWT)
**Description**: Create a new schedule for authenticated user

**Request Body**:
```json
{
  "centerId": "550e8400-e29b-41d4-a716-446655440000",
  "scheduledDate": "2026-03-05T10:00:00Z",
  "slotNumber": 1,
  "description": "BI Renewal - National ID"
}
```

**Success Response (201 Created)**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "centerId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-uuid",
  "scheduledDate": "2026-03-05T10:00:00Z",
  "slotNumber": 1,
  "description": "BI Renewal - National ID",
  "status": "PENDING",
  "createdAt": "2026-03-01T15:30:00Z",
  "updatedAt": "2026-03-01T15:30:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Scheduled date is not in the future
- `404 Not Found`: Center with given ID does not exist
- `409 Conflict`: User already has a schedule for this center on this date
- `401 Unauthorized`: Missing or invalid authentication token

### GET /schedules
**Authentication**: Optional
**Description**: Get all schedules, optionally filtered by center

**Query Parameters**:
- `centerId` (optional, UUID): Filter schedules by center

**Success Response (200 OK)**:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "centerId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-uuid",
    "scheduledDate": "2026-03-05T10:00:00Z",
    "status": "PENDING",
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "center": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "DNIC Luanda"
    }
  }
]
```

### GET /schedules/user/me
**Authentication**: Required
**Description**: Get authenticated user's schedules

**Success Response (200 OK)**:
Same as GET /schedules but filtered to current user only.

**Error Responses**:
- `401 Unauthorized`: Missing or invalid authentication token

### GET /schedules/:id
**Authentication**: Optional
**Description**: Get a single schedule by ID

**Path Parameters**:
- `id` (required, UUID): Schedule ID

**Success Response (200 OK)**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  ...
}
```

**Error Responses**:
- `404 Not Found`: Schedule with given ID does not exist

### PUT /schedules/:id
**Authentication**: Required
**Description**: Update schedule (primarily for status transitions)

**Path Parameters**:
- `id` (required, UUID): Schedule ID

**Request Body** (status update example):
```json
{
  "status": "CONFIRMED"
}
```

**Success Response (200 OK)**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "CONFIRMED",
  ...
}
```

**Error Responses**:
- `400 Bad Request`: Invalid status transition
- `404 Not Found`: Schedule with given ID does not exist
- `401 Unauthorized`: Missing or invalid authentication token

### DELETE /schedules/:id/cancel
**Authentication**: Required
**Description**: Cancel a schedule (alternative cancellation endpoint)

**Path Parameters**:
- `id` (required, UUID): Schedule ID

**Success Response (200 OK)**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "CANCELLED",
  ...
}
```

**Error Responses**:
- `400 Bad Request`: Cannot cancel a completed schedule
- `404 Not Found`: Schedule with given ID does not exist
- `401 Unauthorized`: Missing or invalid authentication token

### DELETE /schedules/:id
**Authentication**: Required
**Description**: Permanently delete a schedule (hard delete)

**Path Parameters**:
- `id` (required, UUID): Schedule ID

**Success Response (204 No Content)**: No body returned

**Error Responses**:
- `404 Not Found`: Schedule with given ID does not exist
- `401 Unauthorized`: Missing or invalid authentication token

## Testing

### Unit Tests
**Location**: `src/modules/schedules/schedules.service.spec.ts`

**Coverage**:
- ✅ Service creation with valid data
- ✅ Service creation with past date (should fail)
- ✅ Service creation with non-existent center (should fail)
- ✅ Service creation with duplicate (should fail)
- ✅ Finding schedules (all, by user, by center, by ID)
- ✅ Status transitions (valid and invalid)
- ✅ Schedule cancellation

**Target**: 90%+ code coverage

### E2E Tests
**Location**: `test/schedules.e2e-spec.ts`

**Coverage**:
- ✅ POST /schedules with valid data
- ✅ POST /schedules with past date (validation)
- ✅ POST /schedules with non-existent center (validation)
- ✅ POST /schedules with duplicate (conflict handling)
- ✅ GET /schedules (no filter)
- ✅ GET /schedules?centerId=xyz (with filter)
- ✅ GET /schedules/user/me (user's schedules)
- ✅ GET /schedules/:id (single schedule)
- ✅ PUT /schedules/:id (status updates and transitions)
- ✅ DELETE /schedules/:id/cancel (cancellation)
- ✅ Authentication requirements

**Target**: All happy paths + error cases covered

## Implementation Status

### ✅ Completed
- [x] SchedulesService with core logic
- [x] SchedulesController with all endpoints
- [x] CreateScheduleDto with validators
- [x] UpdateScheduleDto for status updates
- [x] Future date validation (@IsFutureDate)
- [x] Center existence validation
- [x] Duplicate schedule prevention
- [x] Status transition validation
- [x] Schedule cancellation with validation
- [x] Unit tests (src/modules/schedules/schedules.service.spec.ts)
- [x] E2E tests (test/schedules.e2e-spec.ts)

### 🔄 In Progress / Future
- [ ] Business hours validation (FR-007)
- [ ] Role-based access control (RBAC)
- [ ] Permission checks on update/delete
- [ ] Notification service integration

## Examples

### Example Flow: User Books an Appointment
```
1. User calls: POST /schedules
   - Body: { centerId, scheduledDate, slotNumber }
   - System: Validates future date, center exists, no duplicates
   - Creates schedule with status PENDING

2. System: Schedule exists with PENDING status
   - User can see it via GET /schedules/user/me

3. Center staff: Confirms appointment
   - Calls: PUT /schedules/:id { status: "CONFIRMED" }
   - Status transitions: PENDING -> CONFIRMED

4. On appointment day:
   - Center: PUT /schedules/:id { status: "IN_PROGRESS" }
   - Status transitions: CONFIRMED -> IN_PROGRESS

5. After service:
   - Center: PUT /schedules/:id { status: "COMPLETED" }
   - Status transitions: IN_PROGRESS -> COMPLETED
   - Schedule is now immutable

User can cancel at any point before COMPLETED:
- User: DELETE /schedules/:id/cancel
- Status becomes: CANCELLED (terminal state)
```

