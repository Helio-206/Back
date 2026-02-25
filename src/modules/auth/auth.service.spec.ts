# Exemplo de teste unitário para AuthService

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '@database/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        nome: 'Test User',
        senha: 'password123',
      };

      const user = {
        id: '1',
        email: 'test@example.com',
        nome: 'Test User',
        role: 'CIDADAO',
        ativo: true,
        createdAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        ...user,
        password: 'hashed',
      } as any);

      const result = await service.register(registerDto);

      expect(result.email).toBe(registerDto.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw if user exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        nome: 'Test User',
        senha: 'password123',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({} as any);

      expect(service.register(registerDto)).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should return access token on valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        senha: 'password123',
      };

      // Mock será implementado...
      // expect(result).toHaveProperty('access_token');
    });
  });
});
