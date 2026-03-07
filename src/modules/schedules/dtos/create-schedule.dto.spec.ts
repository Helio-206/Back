import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateScheduleDto } from './create-schedule.dto';

describe('CreateScheduleDto Validations', () => {
  const validPayload = () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    return {
      scheduledDate: futureDate.toISOString(),
      centerId: 'valid-center-id',
      estadoAgendamentoId: 'estado-1',
    };
  };

  describe('scheduledDate', () => {
    it('should accept a valid future date', async () => {
      const dto = plainToInstance(CreateScheduleDto, validPayload());

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject a past date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const dto = plainToInstance(CreateScheduleDto, {
        ...validPayload(),
        scheduledDate: pastDate.toISOString(),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isFutureDate');
    });

    it('should reject today date', async () => {
      const today = new Date();

      const dto = plainToInstance(CreateScheduleDto, {
        ...validPayload(),
        scheduledDate: today.toISOString(),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid date format', async () => {
      const dto = plainToInstance(CreateScheduleDto, {
        ...validPayload(),
        scheduledDate: 'not-a-date',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should require scheduledDate', async () => {
      const dto = plainToInstance(CreateScheduleDto, {
        ...validPayload(),
        scheduledDate: undefined,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('centerId', () => {
    it('should accept a valid centerId', async () => {
      const dto = plainToInstance(CreateScheduleDto, {
        ...validPayload(),
        centerId: 'valid-center-id-123',
      });

      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'centerId')).toHaveLength(0);
    });

    it('should require centerId', async () => {
      const dto = plainToInstance(CreateScheduleDto, {
        ...validPayload(),
        centerId: undefined,
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'centerId')).toBeTruthy();
    });

    it('should reject non-string centerId', async () => {
      const dto = plainToInstance(CreateScheduleDto, {
        ...validPayload(),
        centerId: 123,
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'centerId')).toBeTruthy();
    });
  });

  describe('slotNumber', () => {
    it('should accept valid slotNumber', async () => {
      const dto = plainToInstance(CreateScheduleDto, {
        ...validPayload(),
        slotNumber: 5,
      });

      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'slotNumber')).toHaveLength(0);
    });

    it('should reject slotNumber of 0', async () => {
      const dto = plainToInstance(CreateScheduleDto, {
        ...validPayload(),
        slotNumber: 0,
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'slotNumber')).toBeTruthy();
    });

    it('should allow optional slotNumber', async () => {
      const dto = plainToInstance(CreateScheduleDto, validPayload());

      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'slotNumber')).toHaveLength(0);
    });
  });

  describe('description and notes', () => {
    it('should allow optional description and notes', async () => {
      const dto = plainToInstance(CreateScheduleDto, {
        ...validPayload(),
        description: 'Renewal appointment',
        notes: 'Bring identity documents',
      });

      const errors = await validate(dto);
      expect(errors.filter((e) => ['description', 'notes'].includes(e.property))).toHaveLength(0);
    });
  });

  describe('estadoAgendamentoId', () => {
    it('should require estadoAgendamentoId', async () => {
      const dto = plainToInstance(CreateScheduleDto, {
        ...validPayload(),
        estadoAgendamentoId: undefined,
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'estadoAgendamentoId')).toBeTruthy();
    });

    it('should reject non-string estadoAgendamentoId', async () => {
      const dto = plainToInstance(CreateScheduleDto, {
        ...validPayload(),
        estadoAgendamentoId: 123,
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'estadoAgendamentoId')).toBeTruthy();
    });
  });

  describe('tipoServicoId', () => {
    it('should allow optional tipoServicoId', async () => {
      const dto = plainToInstance(CreateScheduleDto, validPayload());

      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'tipoServicoId')).toHaveLength(0);
    });

    it('should reject non-string tipoServicoId', async () => {
      const dto = plainToInstance(CreateScheduleDto, {
        ...validPayload(),
        tipoServicoId: 123,
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'tipoServicoId')).toBeTruthy();
    });
  });
});
