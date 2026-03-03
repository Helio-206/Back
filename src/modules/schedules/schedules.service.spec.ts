import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesService } from './schedules.service';
import { PrismaService } from '@database/prisma.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

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
              findFirst: jest.fn(),
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
    it('should create a schedule with valid data', async () => {
      const userId = 'user-123';
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const createScheduleDto = {
        scheduledDate: futureDate.toISOString(),
        centerId: 'center-123',
        slotNumber: 1,
        description: 'BI Renewal',
      };

      const mockCenter = { id: 'center-123', name: 'Test Center' };
      const expectedSchedule = {
        id: 'schedule-123',
        ...createScheduleDto,
        userId,
        status: 'PENDING',
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

      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(mockCenter as never);
      jest.spyOn(prisma.schedule, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.schedule, 'create').mockResolvedValue(expectedSchedule as never);

      const result = await service.create(userId, createScheduleDto as never);

      expect(result).toEqual(expectedSchedule);
      expect(prisma.center.findUnique).toHaveBeenCalledWith({
        where: { id: 'center-123' },
      });
      expect(prisma.schedule.findFirst).toHaveBeenCalled();
      expect(prisma.schedule.create).toHaveBeenCalled();
    });

    it('should reject schedule with past date', async () => {
      const userId = 'user-123';
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const createScheduleDto = {
        scheduledDate: pastDate.toISOString(),
        centerId: 'center-123',
      };

      const mockCenter = { id: 'center-123', name: 'Test Center' };
      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(mockCenter as never);

      await expect(service.create(userId, createScheduleDto as never)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should reject schedule with non-existent center', async () => {
      const userId = 'user-123';
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const createScheduleDto = {
        scheduledDate: futureDate.toISOString(),
        centerId: 'non-existent-center',
      };

      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(null);

      await expect(service.create(userId, createScheduleDto as never)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should reject duplicate schedule', async () => {
      const userId = 'user-123';
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const createScheduleDto = {
        scheduledDate: futureDate.toISOString(),
        centerId: 'center-123',
        slotNumber: 1,
      };

      const mockCenter = { id: 'center-123', name: 'Test Center' };
      const existingSchedule = { id: 'schedule-existing', ...createScheduleDto, userId };

      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(mockCenter as never);
      jest.spyOn(prisma.schedule, 'findFirst').mockResolvedValue(existingSchedule as never);

      await expect(service.create(userId, createScheduleDto as never)).rejects.toThrow(
        ConflictException
      );
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
          status: 'PENDING',
          user: { id: 'user-1', name: 'User 1', email: 'user1@test.com' },
          center: { id: 'center-1', name: 'Center 1' },
        },
      ];

      jest.spyOn(prisma.schedule, 'findMany').mockResolvedValue(schedules as never);

      const result = await service.findAll();

      expect(result).toEqual(schedules);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no schedules exist', async () => {
      jest.spyOn(prisma.schedule, 'findMany').mockResolvedValue([] as never);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByUser', () => {
    it('should return user schedules', async () => {
      const userId = 'user-123';
      const schedules = [
        {
          id: 'schedule-1',
          scheduledDate: '2026-03-05T10:00:00Z',
          centerId: 'center-1',
          userId,
          status: 'PENDING',
          center: { id: 'center-1', name: 'Center 1' },
        },
      ];

      jest.spyOn(prisma.schedule, 'findMany').mockResolvedValue(schedules as never);

      const result = await service.findByUser(userId);

      expect(result).toEqual(schedules);
      expect(prisma.schedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
        })
      );
    });
  });

  describe('findByCenter', () => {
    it('should return center schedules', async () => {
      const centerId = 'center-123';
      const schedules = [
        {
          id: 'schedule-1',
          scheduledDate: '2026-03-05T10:00:00Z',
          centerId,
          userId: 'user-1',
          status: 'PENDING',
          user: { id: 'user-1', name: 'User 1', email: 'user1@test.com' },
        },
      ];

      jest.spyOn(prisma.schedule, 'findMany').mockResolvedValue(schedules as never);

      const result = await service.findByCenter(centerId);

      expect(result).toEqual(schedules);
      expect(prisma.schedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { centerId },
        })
      );
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
        status: 'PENDING',
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        center: { id: 'center-123', name: 'Test Center' },
      };

      jest.spyOn(prisma.schedule, 'findUnique').mockResolvedValue(schedule as never);

      const result = await service.findOne(scheduleId);

      expect(result).toEqual(schedule);
    });

    it('should return null if schedule not found', async () => {
      jest.spyOn(prisma.schedule, 'findUnique').mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update schedule status with valid transition', async () => {
      const scheduleId = 'schedule-123';
      const currentSchedule = {
        id: scheduleId,
        scheduledDate: '2026-03-05T10:00:00Z',
        centerId: 'center-123',
        userId: 'user-123',
        status: 'PENDING',
      };

      const updateDto = { status: 'CONFIRMED' };

      const updatedSchedule = {
        ...currentSchedule,
        status: 'CONFIRMED',
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        center: { id: 'center-123', name: 'Test Center' },
      };

      jest.spyOn(prisma.schedule, 'findUnique').mockResolvedValue(currentSchedule as never);
      jest.spyOn(prisma.schedule, 'update').mockResolvedValue(updatedSchedule as never);

      const result = await service.update(scheduleId, updateDto as never);

      expect(result.status).toBe('CONFIRMED');
    });

    it('should reject invalid status transition', async () => {
      const scheduleId = 'schedule-123';
      const currentSchedule = {
        id: scheduleId,
        status: 'PENDING',
      };

      jest.spyOn(prisma.schedule, 'findUnique').mockResolvedValue(currentSchedule as never);

      await expect(service.update(scheduleId, { status: 'IN_PROGRESS' } as never)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw NotFoundException if schedule not found', async () => {
      jest.spyOn(prisma.schedule, 'findUnique').mockResolvedValue(null);

      await expect(
        service.update('non-existent', { status: 'CONFIRMED' } as never)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('should cancel a PENDING schedule', async () => {
      const scheduleId = 'schedule-123';
      const schedule = {
        id: scheduleId,
        status: 'PENDING',
      };

      const cancelledSchedule = {
        ...schedule,
        status: 'CANCELLED',
      };

      jest.spyOn(prisma.schedule, 'findUnique').mockResolvedValue(schedule as never);
      jest.spyOn(prisma.schedule, 'update').mockResolvedValue(cancelledSchedule as never);

      const result = await service.cancel(scheduleId);

      expect(result.status).toBe('CANCELLED');
    });

    it('should not cancel a COMPLETED schedule', async () => {
      const scheduleId = 'schedule-123';
      const schedule = {
        id: scheduleId,
        status: 'COMPLETED',
      };

      jest.spyOn(prisma.schedule, 'findUnique').mockResolvedValue(schedule as never);

      await expect(service.cancel(scheduleId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if schedule not found', async () => {
      jest.spyOn(prisma.schedule, 'findUnique').mockResolvedValue(null);

      await expect(service.cancel('non-existent')).rejects.toThrow(NotFoundException);
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
