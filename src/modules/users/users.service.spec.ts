import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
    active: true,
    role: 'CITIZEN',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<any>(PrismaService);
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
    });

    it('should return empty array when no users', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findOne('user-1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userWithoutPassword = { ...mockUser };
      delete (userWithoutPassword as any).password;
      prisma.user.findUnique.mockResolvedValue(userWithoutPassword);
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(userWithoutPassword);
    });

    it('should return null if not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const result = await service.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findByRole', () => {
    it('should find users by role', async () => {
      const adminUser = { ...mockUser, role: 'ADMIN' };
      prisma.user.findMany.mockResolvedValue([adminUser]);
      const result = await service.findByRole('ADMIN');
      expect(result).toEqual([adminUser]);
    });
  });
});
