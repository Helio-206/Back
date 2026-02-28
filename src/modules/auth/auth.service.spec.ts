// Unit test example for AuthService

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '@database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

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
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'CITIZEN',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        dataNascimento: null,
        provinciaNascimento: null,
        provinciaResidencia: null,
        numeroBIAnterior: null,
        filiacao: null,
        genero: null,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        ...user,
        password: 'hashed',
      } as never);

      const result = await service.register(registerDto);

      expect(result.email).toBe(registerDto.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException if user exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 'existing-user' } as never);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow(
        'Utilizador já existe com este email'
      );
    });

    it('should hash the password before saving', async () => {
      const registerDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'plainPassword123',
      };

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        id: '1',
        email: registerDto.email,
        name: registerDto.name,
        role: 'CITIZEN',
        password: hashedPassword,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        dataNascimento: null,
        provinciaNascimento: null,
        provinciaResidencia: null,
        numeroBIAnterior: null,
        filiacao: null,
        genero: null,
      } as never);

      const result = await service.register(registerDto);

      // Verify the service called prisma.user.create
      expect(prisma.user.create).toHaveBeenCalled();

      // Verify password is not returned
      expect(result).not.toHaveProperty('password');

      // Verify other fields are present
      expect(result.email).toBe(registerDto.email);
    });

    it('should save optional BI fields', async () => {
      const registerDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        numeroBIAnterior: '123456789LA123',
        dataNascimento: '1990-01-15',
        provinciaNascimento: 'LUANDA',
        provinciaResidencia: 'LUANDA',
        filiacao: 'João Silva e Maria Silva',
        genero: 'M',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        id: '1',
        email: registerDto.email,
        name: registerDto.name,
        role: 'CITIZEN',
        password: 'hashed',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        numeroBIAnterior: registerDto.numeroBIAnterior,
        dataNascimento: new Date(registerDto.dataNascimento),
        provinciaNascimento: registerDto.provinciaNascimento,
        provinciaResidencia: registerDto.provinciaResidencia,
        filiacao: registerDto.filiacao,
        genero: registerDto.genero,
      } as never);

      const result = await service.register(registerDto);

      expect((result as { numeroBIAnterior?: string }).numeroBIAnterior).toBe('123456789LA123');
      expect((result as { provinciaNascimento?: string }).provinciaNascimento).toBe('LUANDA');
    });
  });

  describe('login', () => {
    it('should return access token on valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);

      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'CITIZEN',
        password: hashedPassword,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as never);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = {
        email: 'notfound@example.com',
        password: 'password123',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Credenciais inválidas');
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      const user = {
        id: '1',
        email: 'test@example.com',
        password: hashedPassword,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as never);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Credenciais inválidas');
    });

    it('should sign JWT with correct payload', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);

      const user = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'CITIZEN',
        password: hashedPassword,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as never);
      const signSpy = jest.spyOn(jwtService, 'sign').mockReturnValue('mock-jwt-token');

      await service.login(loginDto);

      expect(signSpy).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
    });
  });
});
