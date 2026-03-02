import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateScheduleDto } from './create-schedule.dto';

describe('CreateScheduleDto Validations', () => {
  describe('scheduledDate', () => {
    it('should accept a valid future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const dto = plainToInstance(CreateScheduleDto, {
        scheduledDate: futureDate.toISOString(),
        centerId: 'valid-center-id',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject a past date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const dto = plainToInstance(CreateScheduleDto, {
        scheduledDate: pastDate.toISOString(),
        centerId: 'valid-center-id',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isFutureDate');
    });

    it('should reject today date', async () => {
      const today = new Date();

      const dto = plainToInstance(CreateScheduleDto, {
        scheduledDate: today.toISOString(),
        centerId: 'valid-center-id',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid date format', async () => {
      const dto = plainToInstance(CreateScheduleDto, {
        scheduledDate: 'not-a-date',
        centerId: 'valid-center-id',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should require scheduledDate', async () => {
      const dto = plainToInstance(CreateScheduleDto, {
        centerId: 'valid-center-id',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('centerId', () => {
    it('should accept a valid centerId', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const dto = plainToInstance(CreateScheduleDto, {
        scheduledDate: futureDate.toISOString(),
        centerId: 'valid-center-id-123',
      });

      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'centerId')).toHaveLength(0);
    });

    it('should require centerId', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const dto = plainToInstance(CreateScheduleDto, {
        scheduledDate: futureDate.toISOString(),
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'centerId')).toBeTruthy();
    });

    it('should reject non-string centerId', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const dto = plainToInstance(CreateScheduleDto, {
        scheduledDate: futureDate.toISOString(),
        centerId: 123,
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'centerId')).toBeTruthy();
    });
  });

  describe('slotNumber', () => {
    it('should accept valid slotNumber', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const dto = plainToInstance(CreateScheduleDto, {
        scheduledDate: futureDate.toISOString(),
        centerId: 'valid-center-id',
        slotNumber: 5,
      });

      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'slotNumber')).toHaveLength(0);
    });

    it('should reject slotNumber of 0', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const dto = plainToInstance(CreateScheduleDto, {
        scheduledDate: futureDate.toISOString(),
        centerId: 'valid-center-id',
        slotNumber: 0,
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'slotNumber')).toBeTruthy();
    });

    it('should allow optional slotNumber', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const dto = plainToInstance(CreateScheduleDto, {
        scheduledDate: futureDate.toISOString(),
        centerId: 'valid-center-id',
      });

      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'slotNumber')).toHaveLength(0);
    });
  });

  describe('description and notes', () => {
    it('should allow optional description and notes', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const dto = plainToInstance(CreateScheduleDto, {
        scheduledDate: futureDate.toISOString(),
        centerId: 'valid-center-id',
        description: 'Renewal appointment',
        notes: 'Bring identify documents',
      });

      const errors = await validate(dto);
      expect(errors.filter((e) => ['description', 'notes'].includes(e.property))).toHaveLength(0);
    });
  });

  describe('status', () => {
    it('should accept valid status values', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

      for (const status of validStatuses) {
        const dto = plainToInstance(CreateScheduleDto, {
          scheduledDate: futureDate.toISOString(),
          centerId: 'valid-center-id',
          status,
        });

        const errors = await validate(dto);
        expect(errors.filter((e) => e.property === 'status')).toHaveLength(0);
      }
    });

    it('should reject invalid status values', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const dto = plainToInstance(CreateScheduleDto, {
        scheduledDate: futureDate.toISOString(),
        centerId: 'valid-center-id',
        status: 'INVALID_STATUS',
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBeTruthy();
    });

    it('should allow optional status', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const dto = plainToInstance(CreateScheduleDto, {
        scheduledDate: futureDate.toISOString(),
        centerId: 'valid-center-id',
      });

      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'status')).toHaveLength(0);
    });
  });
});
