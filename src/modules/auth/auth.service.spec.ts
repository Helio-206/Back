import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '@database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserAlreadyExistsException, InvalidCredentialsException } from '@common/exceptions';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;

  beforeEach(async () => {
    const prismaModule = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const jwtModule = {
      sign: jest.fn(() => 'test_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaModule },
        { provide: JwtService, useValue: jwtModule },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<any>(PrismaService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test',
        role: 'CITIZEN',
        active: true,
        createdAt: new Date(),
      });

      const result = await service.register({
        email: 'test@test.com',
        name: 'Test',
        password: 'TestPass123',
      });

      expect(result.email).toBe('test@test.com');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw UserAlreadyExistsException if email exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'existing@test.com',
          name: 'Test',
          password: 'TestPass123',
        })
      ).rejects.toThrow(UserAlreadyExistsException);
    });
  });

  describe('login', () => {
    it('should return token on valid credentials', async () => {
      const hashedPass = await bcrypt.hash('TestPass123', 10);

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test',
        password: hashedPass,
        role: 'CITIZEN',
        active: true,
      });

      const result = await service.login({
        email: 'test@test.com',
        password: 'TestPass123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw on invalid password', async () => {
      const hashedPass = await bcrypt.hash('CorrectPass123', 10);

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: hashedPass,
        active: true,
      });

      await expect(
        service.login({
          email: 'test@test.com',
          password: 'WrongPass123',
        })
      ).rejects.toThrow(InvalidCredentialsException);
    });

    it('should throw on user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'noexist@test.com',
          password: 'TestPass123',
        })
      ).rejects.toThrow(InvalidCredentialsException);
    });
  });

  describe('validateUser', () => {
    it('should return user if active', async () => {
      const user = {
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test',
        role: 'CITIZEN',
        active: true,
      };

      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.validateUser('user-1');

      expect(result).toEqual(user);
    });

    it('should return null if inactive', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        active: false,
      });

      const result = await service.validateUser('user-1');

      expect(result).toBeNull();
    });
  });
});
