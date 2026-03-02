import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesService } from './schedules.service';
import { PrismaService } from '@database/prisma.service';

describe('SchedulesService', () => {
  let service: SchedulesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulesService,
        {
          provide: PrismaService,
          useValue: {
            schedule: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            center: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SchedulesService>(SchedulesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a schedule for a user', async () => {
      const userId = 'user-123';
      const createScheduleDto = {
        scheduledDate: '2026-03-05T10:00:00Z',
        centerId: 'center-123',
        slotNumber: 1,
        description: 'BI Renewal',
      };

      const expectedSchedule = {
        id: 'schedule-123',
        ...createScheduleDto,
        userId,
        user: {
          id: userId,
          name: 'Test User',
          email: 'test@example.com',
        },
        center: {
          id: 'center-123',
          name: 'Test Center',
        },
      };

      jest.spyOn(prisma.schedule, 'create').mockResolvedValue(expectedSchedule as never);

      const result = await service.create(userId, createScheduleDto as never);

      expect(result).toEqual(expectedSchedule);
      expect(prisma.schedule.create).toHaveBeenCalledWith({
        data: {
          scheduledDate: createScheduleDto.scheduledDate,
          centerId: createScheduleDto.centerId,
          slotNumber: createScheduleDto.slotNumber,
          description: createScheduleDto.description,
          userId,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          center: {
            select: { id: true, name: true },
          },
        },
      });
    });

    it('should handle optional fields', async () => {
      const userId = 'user-123';
      const createScheduleDto = {
        scheduledDate: '2026-03-05T10:00:00Z',
        centerId: 'center-123',
      };

      const expectedSchedule = {
        id: 'schedule-123',
        scheduledDate: createScheduleDto.scheduledDate,
        centerId: createScheduleDto.centerId,
        userId,
        slotNumber: null,
        description: null,
        notes: null,
        user: {
          id: userId,
          name: 'Test User',
          email: 'test@example.com',
        },
        center: {
          id: 'center-123',
          name: 'Test Center',
        },
      };

      jest.spyOn(prisma.schedule, 'create').mockResolvedValue(expectedSchedule as never);

      const result = await service.create(userId, createScheduleDto as never);

      expect(result).toEqual(expectedSchedule);
      expect(result.slotNumber).toBeNull();
      expect(result.description).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all schedules', async () => {
      const schedules = [
        {
          id: 'schedule-1',
          scheduledDate: '2026-03-05T10:00:00Z',
          centerId: 'center-1',
          userId: 'user-1',
          user: { id: 'user-1', name: 'User 1', email: 'user1@test.com' },
          center: { id: 'center-1', name: 'Center 1' },
        },
        {
          id: 'schedule-2',
          scheduledDate: '2026-03-06T14:00:00Z',
          centerId: 'center-2',
          userId: 'user-2',
          user: { id: 'user-2', name: 'User 2', email: 'user2@test.com' },
          center: { id: 'center-2', name: 'Center 2' },
        },
      ];

      jest.spyOn(prisma.schedule, 'findMany').mockResolvedValue(schedules as never);

      const result = await service.findAll();

      expect(result).toEqual(schedules);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no schedules exist', async () => {
      jest.spyOn(prisma.schedule, 'findMany').mockResolvedValue([] as never);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findByUser', () => {
    it('should return schedules for a specific user', async () => {
      const userId = 'user-123';
      const schedules = [
        {
          id: 'schedule-1',
          scheduledDate: '2026-03-05T10:00:00Z',
          centerId: 'center-1',
          userId,
          center: { id: 'center-1', name: 'Center 1' },
        },
      ];

      jest.spyOn(prisma.schedule, 'findMany').mockResolvedValue(schedules as never);

      const result = await service.findByUser(userId);

      expect(result).toEqual(schedules);
      expect(prisma.schedule.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          center: {
            select: { id: true, name: true },
          },
        },
      });
    });
  });

  describe('findByCenter', () => {
    it('should return schedules for a specific center', async () => {
      const centerId = 'center-123';
      const schedules = [
        {
          id: 'schedule-1',
          scheduledDate: '2026-03-05T10:00:00Z',
          centerId,
          userId: 'user-1',
          user: { id: 'user-1', name: 'User 1', email: 'user1@test.com' },
        },
      ];

      jest.spyOn(prisma.schedule, 'findMany').mockResolvedValue(schedules as never);

      const result = await service.findByCenter(centerId);

      expect(result).toEqual(schedules);
      expect(prisma.schedule.findMany).toHaveBeenCalledWith({
        where: { centerId },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a specific schedule', async () => {
      const scheduleId = 'schedule-123';
      const schedule = {
        id: scheduleId,
        scheduledDate: '2026-03-05T10:00:00Z',
        centerId: 'center-123',
        userId: 'user-123',
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        center: { id: 'center-123', name: 'Test Center' },
      };

      jest.spyOn(prisma.schedule, 'findUnique').mockResolvedValue(schedule as never);

      const result = await service.findOne(scheduleId);

      expect(result).toEqual(schedule);
      expect(prisma.schedule.findUnique).toHaveBeenCalledWith({
        where: { id: scheduleId },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          center: {
            select: { id: true, name: true },
          },
        },
      });
    });

    it('should return null if schedule not found', async () => {
      jest.spyOn(prisma.schedule, 'findUnique').mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a schedule', async () => {
      const scheduleId = 'schedule-123';
      const updateDto = {
        description: 'Updated description',
      };

      const updatedSchedule = {
        id: scheduleId,
        scheduledDate: '2026-03-05T10:00:00Z',
        centerId: 'center-123',
        userId: 'user-123',
        description: updateDto.description,
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        center: { id: 'center-123', name: 'Test Center' },
      };

      jest.spyOn(prisma.schedule, 'update').mockResolvedValue(updatedSchedule as never);

      const result = await service.update(scheduleId, updateDto as never);

      expect(result).toEqual(updatedSchedule);
      expect(result.description).toBe(updateDto.description);
    });
  });

  describe('cancel', () => {
    it('should cancel a schedule', async () => {
      const scheduleId = 'schedule-123';

      jest.spyOn(prisma.schedule, 'update').mockResolvedValue({
        id: scheduleId,
        status: 'CANCELLED',
      } as never);

      const result = await service.cancel(scheduleId);

      expect(prisma.schedule.update).toHaveBeenCalledWith({
        where: { id: scheduleId },
        data: { status: 'CANCELLED' },
      });
      expect(result.status).toBe('CANCELLED');
    });
  });

  describe('delete', () => {
    it('should delete a schedule', async () => {
      const scheduleId = 'schedule-123';

      jest.spyOn(prisma.schedule, 'delete').mockResolvedValue({ id: scheduleId } as never);

      await service.delete(scheduleId);

      expect(prisma.schedule.delete).toHaveBeenCalledWith({
        where: { id: scheduleId },
      });
    });
  });
});
