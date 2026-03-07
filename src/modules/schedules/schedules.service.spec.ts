import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesService } from './schedules.service';
import { PrismaService } from '@database/prisma.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('SchedulesService', () => {
  let service: SchedulesService;
  let prisma: any;

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
            estadoAgendamento: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
            },
            tipoServico: {
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
        estadoAgendamentoId: 'estado-1',
        tipoServicoId: 'tipo-1',
        slotNumber: 1,
        description: 'BI renewal',
      };

      const mockCenter = { id: 'center-123', name: 'Test Center' };
      const mockEstado = { id: 'estado-1', status: 'AGENDADO' };
      const mockTipo = { id: 'tipo-1', descricao: 'BI Renewal' };
      const expectedSchedule = {
        id: 'schedule-123',
        ...createScheduleDto,
        userId,
      };

      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(mockCenter as never);
      jest.spyOn(prisma.estadoAgendamento, 'findUnique').mockResolvedValue(mockEstado as never);
      jest.spyOn(prisma.tipoServico, 'findUnique').mockResolvedValue(mockTipo as never);
      jest.spyOn(prisma.schedule, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.schedule, 'create').mockResolvedValue(expectedSchedule as never);

      const result = await service.create(userId, createScheduleDto as never);

      expect(result).toEqual(expectedSchedule);
      expect(prisma.center.findUnique).toHaveBeenCalledWith({ where: { id: 'center-123' } });
      expect(prisma.estadoAgendamento.findUnique).toHaveBeenCalledWith({
        where: { id: 'estado-1' },
      });
      expect(prisma.tipoServico.findUnique).toHaveBeenCalledWith({ where: { id: 'tipo-1' } });
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
        estadoAgendamentoId: 'estado-1',
      };

      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue({ id: 'center-123' } as never);
      jest
        .spyOn(prisma.estadoAgendamento, 'findUnique')
        .mockResolvedValue({ id: 'estado-1', status: 'AGENDADO' } as never);

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
        estadoAgendamentoId: 'estado-1',
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
        estadoAgendamentoId: 'estado-1',
      };

      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue({ id: 'center-123' } as never);
      jest
        .spyOn(prisma.estadoAgendamento, 'findUnique')
        .mockResolvedValue({ id: 'estado-1', status: 'AGENDADO' } as never);
      jest.spyOn(prisma.schedule, 'findFirst').mockResolvedValue({ id: 'existing-schedule' } as never);

      await expect(service.create(userId, createScheduleDto as never)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('findAll/findByUser/findByCenter/findOne', () => {
    it('should proxy query results', async () => {
      const schedules = [{ id: 'schedule-1' }];
      jest.spyOn(prisma.schedule, 'findMany').mockResolvedValue(schedules as never);
      jest.spyOn(prisma.schedule, 'findUnique').mockResolvedValue({ id: 'schedule-1' } as never);

      expect(await service.findAll()).toEqual(schedules);
      expect(await service.findByUser('user-1')).toEqual(schedules);
      expect(await service.findByCenter('center-1')).toEqual(schedules);
      expect(await service.findOne('schedule-1')).toEqual({ id: 'schedule-1' });
    });
  });

  describe('update', () => {
    it('should update schedule estado with valid transition', async () => {
      const scheduleId = 'schedule-123';
      const currentSchedule = {
        id: scheduleId,
        estadoAgendamentoId: 'estado-1',
        estadoAgendamento: { status: 'AGENDADO' },
      };

      const updateDto = { estadoAgendamentoId: 'estado-2' };
      const newEstado = { id: 'estado-2', status: 'CONFIRMADO' };
      const updatedSchedule = {
        ...currentSchedule,
        ...updateDto,
      };

      jest.spyOn(prisma.schedule, 'findUnique').mockResolvedValue(currentSchedule as never);
      jest.spyOn(prisma.estadoAgendamento, 'findUnique').mockResolvedValue(newEstado as never);
      jest.spyOn(prisma.schedule, 'update').mockResolvedValue(updatedSchedule as never);

      const result = await service.update(scheduleId, updateDto as never);

      expect((result as any).estadoAgendamentoId).toBe('estado-2');
    });

    it('should reject invalid status transition', async () => {
      const scheduleId = 'schedule-123';
      const currentSchedule = {
        id: scheduleId,
        estadoAgendamentoId: 'estado-1',
        estadoAgendamento: { status: 'AGENDADO' },
      };

      jest.spyOn(prisma.schedule, 'findUnique').mockResolvedValue(currentSchedule as never);
      jest
        .spyOn(prisma.estadoAgendamento, 'findUnique')
        .mockResolvedValue({ id: 'estado-3', status: 'RETIRADO' } as never);

      await expect(
        service.update(scheduleId, { estadoAgendamentoId: 'estado-3' } as never)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if schedule not found', async () => {
      jest.spyOn(prisma.schedule, 'findUnique').mockResolvedValue(null);

      await expect(
        service.update('non-existent', { estadoAgendamentoId: 'estado-2' } as never)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('should cancel an active schedule', async () => {
      const scheduleId = 'schedule-123';
      const schedule = {
        id: scheduleId,
        estadoAgendamento: { status: 'AGENDADO' },
      };

      const cancelado = { id: 'estado-cancelado', status: 'CANCELADO' };
      const cancelledSchedule = {
        ...schedule,
        estadoAgendamentoId: cancelado.id,
      };

      jest.spyOn(prisma.schedule, 'findUnique').mockResolvedValue(schedule as never);
      jest.spyOn(prisma.estadoAgendamento, 'findFirst').mockResolvedValue(cancelado as never);
      jest.spyOn(prisma.schedule, 'update').mockResolvedValue(cancelledSchedule as never);

      const result = await service.cancel(scheduleId);

      expect((result as any).estadoAgendamentoId).toBe(cancelado.id);
    });

    it('should not cancel a completed schedule', async () => {
      const scheduleId = 'schedule-123';
      const schedule = {
        id: scheduleId,
        estadoAgendamento: { status: 'RETIRADO' },
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
