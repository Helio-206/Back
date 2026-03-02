import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CentersService } from './centers.service';
import { PrismaService } from '@database/prisma.service';
import { CenterType, Provincia } from '@prisma/client';
import { Prisma } from '@prisma/client';

describe('CentersService', () => {
  let service: CentersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    center: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  const mockUser = {
    id: 'user-1',
    email: 'center@test.com',
    name: 'Center Manager',
  };

  const mockCenter = {
    id: 'center-1',
    userId: 'user-1',
    name: 'Test Center',
    description: 'Test center description',
    type: CenterType.ADMINISTRATIVE,
    address: 'Rua Principal, 123',
    provincia: Provincia.LUANDA,
    phone: '923456789',
    email: 'center@test.com',
    openingTime: '08:00',
    closingTime: '17:00',
    attendanceDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY',
    capacidadeAgentos: 10,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CentersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CentersService>(CentersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new center successfully', async () => {
      const createCenterDto = {
        name: 'Test Center',
        type: CenterType.ADMINISTRATIVE,
        address: 'Rua Principal, 123',
        provincia: Provincia.LUANDA,
        openingTime: '08:00',
        closingTime: '17:00',
        attendanceDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY',
        capacidadeAgentos: 10,
      };

      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.center, 'create').mockResolvedValue({
        ...mockCenter,
        ...createCenterDto,
      } as never);

      const result = await service.create('user-1', createCenterDto);

      expect(result.name).toBe(createCenterDto.name);
      expect(prisma.center.create).toHaveBeenCalled();
    });

    it('should use defaults for optional time fields', async () => {
      const createCenterDto = {
        name: 'Test Center',
        type: CenterType.ADMINISTRATIVE,
        address: 'Rua Principal, 123',
        provincia: Provincia.LUANDA,
      };

      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.center, 'create').mockResolvedValue({
        ...mockCenter,
        ...createCenterDto,
        openingTime: '08:00',
        closingTime: '17:00',
        attendanceDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY',
      } as never);

      await service.create('user-1', createCenterDto);

      const callArgs = (prisma.center.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.openingTime).toBe('08:00');
      expect(callArgs.data.closingTime).toBe('17:00');
      expect(callArgs.data.attendanceDays).toBe('MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY');
    });

    it('should throw if opening time is not before closing time', async () => {
      const createCenterDto = {
        name: 'Test Center',
        type: CenterType.ADMINISTRATIVE,
        address: 'Rua Principal, 123',
        provincia: Provincia.LUANDA,
        openingTime: '17:00',
        closingTime: '08:00',
      };

      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(null);

      await expect(
        service.create('user-1', createCenterDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if opening time equals closing time', async () => {
      const createCenterDto = {
        name: 'Test Center',
        type: CenterType.HEALTH,
        address: 'Rua Principal, 123',
        provincia: Provincia.LUANDA,
        openingTime: '08:00',
        closingTime: '08:00',
      };

      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(null);

      await expect(
        service.create('user-1', createCenterDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if attendance days are invalid', async () => {
      const createCenterDto = {
        name: 'Test Center',
        type: CenterType.HEALTH,
        address: 'Rua Principal, 123',
        provincia: Provincia.LUANDA,
        attendanceDays: 'MONDAY,INVALIDDAY',
      };

      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(null);

      await expect(
        service.create('user-1', createCenterDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if user already has a center', async () => {
      const createCenterDto = {
        name: 'Test Center',
        type: CenterType.HEALTH,
        address: 'Rua Principal, 123',
        provincia: Provincia.LUANDA,
      };

      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue({
        id: 'existing-center',
      } as never);

      await expect(
        service.create('user-1', createCenterDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if user not found', async () => {
      const createCenterDto = {
        name: 'Test Center',
        type: CenterType.HEALTH,
        address: 'Rua Principal, 123',
        provincia: Provincia.LUANDA,
      };

      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(null);
      
      const prismaError = new Error('User not found');
      (prismaError as any).code = 'P2025';
      Object.setPrototypeOf(prismaError, Prisma.PrismaClientKnownRequestError.prototype);
      
      jest.spyOn(prisma.center, 'create').mockRejectedValue(prismaError as never);

      await expect(
        service.create('user-1', createCenterDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all centers', async () => {
      jest.spyOn(prisma.center, 'findMany').mockResolvedValue([mockCenter] as never);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe(mockCenter.name);
      expect(prisma.center.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it('should filter by province', async () => {
      jest.spyOn(prisma.center, 'findMany').mockResolvedValue([mockCenter] as never);

      await service.findAll({ provincia: Provincia.LUANDA });

      expect(prisma.center.findMany).toHaveBeenCalledWith({
        where: { provincia: Provincia.LUANDA },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it('should filter by active status', async () => {
      jest.spyOn(prisma.center, 'findMany').mockResolvedValue([mockCenter] as never);

      await service.findAll({ active: true });

      expect(prisma.center.findMany).toHaveBeenCalledWith({
        where: { active: true },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it('should apply multiple filters', async () => {
      jest.spyOn(prisma.center, 'findMany').mockResolvedValue([mockCenter] as never);

      await service.findAll({ provincia: Provincia.LUANDA, active: true });

      expect(prisma.center.findMany).toHaveBeenCalledWith({
        where: { provincia: Provincia.LUANDA, active: true },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });
  });

  describe('findByProvince', () => {
    it('should return centers in a specific province', async () => {
      jest.spyOn(prisma.center, 'findMany').mockResolvedValue([mockCenter] as never);

      const result = await service.findByProvince(Provincia.LUANDA);

      expect(result).toHaveLength(1);
      expect(prisma.center.findMany).toHaveBeenCalledWith({
        where: { provincia: Provincia.LUANDA, active: true },
        include: expect.any(Object),
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty array if no centers in province', async () => {
      jest.spyOn(prisma.center, 'findMany').mockResolvedValue([] as never);

      const result = await service.findByProvince(Provincia.BENGUELA);

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a center by id with schedules', async () => {
      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(mockCenter as never);

      const result = await service.findOne('center-1');

      expect(result.id).toBe('center-1');
      expect(prisma.center.findUnique).toHaveBeenCalledWith({
        where: { id: 'center-1' },
        include: expect.objectContaining({
          schedules: expect.any(Object),
        }),
      });
    });

    it('should throw if center not found', async () => {
      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a center successfully', async () => {
      const updateCenterDto = {
        name: 'Updated Center Name',
      };

      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(mockCenter as never);
      jest.spyOn(prisma.center, 'update').mockResolvedValue({
        ...mockCenter,
        ...updateCenterDto,
      } as never);

      const result = await service.update('center-1', updateCenterDto);

      expect(result.name).toBe(updateCenterDto.name);
      expect(prisma.center.update).toHaveBeenCalled();
    });

    it('should throw if center not found', async () => {
      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate new time range on update', async () => {
      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(mockCenter as never);

      await expect(
        service.update('center-1', {
          openingTime: '17:00',
          closingTime: '08:00',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate attendance days on update', async () => {
      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(mockCenter as never);

      await expect(
        service.update('center-1', {
          attendanceDays: 'MONDAY,INVALIDDAY',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deactivate', () => {
    it('should deactivate a center', async () => {
      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(mockCenter as never);
      jest.spyOn(prisma.center, 'update').mockResolvedValue({
        ...mockCenter,
        active: false,
      } as never);

      const result = await service.deactivate('center-1');

      expect(result.active).toBe(false);
      expect(prisma.center.update).toHaveBeenCalledWith({
        where: { id: 'center-1' },
        data: { active: false },
        include: expect.any(Object),
      });
    });

    it('should throw if center not found', async () => {
      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(null);

      await expect(service.deactivate('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('reactivate', () => {
    it('should reactivate a center', async () => {
      const inactiveCenter = { ...mockCenter, active: false };
      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(inactiveCenter as never);
      jest.spyOn(prisma.center, 'update').mockResolvedValue({
        ...inactiveCenter,
        active: true,
      } as never);

      const result = await service.reactivate('center-1');

      expect(result.active).toBe(true);
      expect(prisma.center.update).toHaveBeenCalledWith({
        where: { id: 'center-1' },
        data: { active: true },
        include: expect.any(Object),
      });
    });
  });

  describe('delete', () => {
    it('should delete a center permanently', async () => {
      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(mockCenter as never);
      jest.spyOn(prisma.center, 'delete').mockResolvedValue(mockCenter as never);

      const result = await service.delete('center-1');

      expect(result).toHaveProperty('message');
      expect(prisma.center.delete).toHaveBeenCalledWith({
        where: { id: 'center-1' },
      });
    });

    it('should throw if center not found', async () => {
      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(null);

      await expect(service.delete('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStatistics', () => {
    it('should return statistics about centers', async () => {
      jest.spyOn(prisma.center, 'count').mockResolvedValue(5 as never);
      jest
        .spyOn(prisma.center, 'count')
        .mockResolvedValueOnce(5 as never)
        .mockResolvedValueOnce(4 as never);
      jest.spyOn(prisma.center, 'groupBy').mockResolvedValue([
        {
          provincia: Provincia.LUANDA,
          _count: 2,
        },
        {
          provincia: Provincia.BENGUELA,
          _count: 2,
        },
      ] as never);

      const result = await service.getStatistics();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('active');
      expect(result).toHaveProperty('byProvince');
      expect(result.byProvince).toHaveLength(2);
    });
  });

  describe('Time validation edge cases', () => {
    it('should accept valid time formats', async () => {
      const validTimePairs = [
        { opening: '00:00', closing: '23:59' },
        { opening: '08:00', closing: '12:30' },
        { opening: '14:00', closing: '18:00' },
      ];

      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.center, 'create').mockResolvedValue(mockCenter as never);

      for (const { opening, closing } of validTimePairs) {
        const dto = {
          name: 'Test',
          type: CenterType.HEALTH,
          address: 'Endereco',
          provincia: Provincia.LUANDA,
          openingTime: opening,
          closingTime: closing,
        };

        await expect(service.create('user-1', dto)).resolves.not.toThrow();
      }
    });

    it('should validate all valid attendance days', async () => {
      jest.spyOn(prisma.center, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.center, 'create').mockResolvedValue(mockCenter as never);

      const validDays = 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY';
      const dto = {
        name: 'Test',
        type: CenterType.HEALTH,
        address: 'Endereco',
        provincia: Provincia.LUANDA,
        attendanceDays: validDays,
      };

      await expect(service.create('user-1', dto)).resolves.not.toThrow();
    });
  });
});
