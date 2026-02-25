# Business Rules - Scheduling

## Overview

This document defines the business rules for the Scheduling module.

## Functional Rules

### FR-001: Future Scheduling Only
**Description**: Citizens can schedule only for future dates.

**Implementation**:
```typescript
// In CreateScheduleDto
@IsDateString()
scheduledDate: string;

// In SchedulesService.create()
const scheduledDate = new Date(createDto.scheduledDate);
if (scheduledDate <= new Date()) {
  throw new BadRequestException('Scheduled date must be in the future');
}
```

**Exception**: ADMIN can create backdated schedules when required.

### FR-002: No Duplicate Schedule in Same Center and Date
**Description**: A citizen cannot have more than one schedule in the same center on the same date.

**Implementation**:
```typescript
async create(userId: string, createDto: CreateScheduleDto) {
  const existing = await this.prisma.schedule.findFirst({
    where: {
      userId,
      centerId: createDto.centerId,
      scheduledDate: createDto.scheduledDate,
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
  });

  if (existing) {
    throw new ConflictException('Schedule already exists for this center and date');
  }

  return this.prisma.schedule.create({ ... });
}
```

### FR-003: Schedule Lifecycle
**Description**: Valid states and allowed transitions.

**States**:
- `PENDING`: Created, waiting for confirmation
- `CONFIRMED`: Center confirmed
- `IN_PROGRESS`: Service in progress
- `COMPLETED`: Service completed
- `CANCELLED`: Cancelled by citizen, center, or admin

**Allowed transitions**:
```
PENDING -> CONFIRMED -> IN_PROGRESS -> COMPLETED
   |          |            |
   +----------+------------+-> CANCELLED
```

**Rule**: Once `COMPLETED`, the status is immutable.

**Implementation**:
```typescript
async update(id: string, updateDto: UpdateScheduleDto) {
  const current = await this.prisma.schedule.findUnique({ where: { id } });

  if (current.status === 'COMPLETED') {
    throw new BadRequestException('Completed schedules cannot be updated');
  }

  const validTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  const allowed = validTransitions[current.status];
  if (!allowed.includes(updateDto.status)) {
    throw new BadRequestException(
      `Invalid status transition: ${current.status} -> ${updateDto.status}`,
    );
  }

  return this.prisma.schedule.update({ ... });
}
```

### FR-004: Schedule Cancellation
**Description**: Schedules can be cancelled before completion.

**Who can cancel**:
- Citizen can cancel own schedules
- Center can cancel its schedules
- Admin can cancel any schedule

**Validation**:
- Status cannot be `COMPLETED`
- Notes are optional

**Implementation**:
```typescript
async cancel(id: string, userId: string, role: Role) {
  const schedule = await this.findOne(id);

  if (role === 'CITIZEN' && schedule.userId !== userId) {
    throw new ForbiddenException('Only the owner can cancel this schedule');
  }

  if (schedule.status === 'COMPLETED') {
    throw new BadRequestException('Cannot cancel a completed schedule');
  }

  return this.prisma.schedule.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });
}
```

### FR-005: Schedule Visibility
**Description**: Each role sees only authorized schedules.

**CITIZEN**:
- Can view only own schedules
- Endpoint: `GET /schedules/user/me`

**CENTER**:
- Can view schedules of its center
- Endpoint: `GET /schedules?centerId=xyz`

**ADMIN**:
- Can view all schedules
- Endpoint: `GET /schedules`

### FR-006: Center Must Exist and Be Active
**Description**: Scheduling is not allowed in inactive centers.

**Implementation**:
```typescript
const center = await this.prisma.center.findUnique({
  where: { id: createDto.centerId },
});

if (!center || !center.active) {
  throw new BadRequestException('Center does not exist or is inactive');
}
```

### FR-007: Business Hours Validation (Future)
**Description**: Validate schedule times within center business hours.

**Placeholder**:
```typescript
// TODO FR-007: scheduledDate must be within openingTime/closingTime
// TODO: consider attendanceDays
```

## Data Rules

### DR-001: Required Fields
- `centerId`: required
- `scheduledDate`: required
- `description`: optional
