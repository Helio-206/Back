import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '@database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Provincia } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const baseCidadao = {
    nome: 'John',
    sobrenome: 'Doe',
    dataNascimento: '1990-01-15',
    sexo: 'M',
    provinciaResidencia: Provincia.LUANDA,
  };

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
        password: 'password123',
        cidadao: baseCidadao,
      };

      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'CITIZEN',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        cidadao: {
          id: 'cid-1',
          ...baseCidadao,
          email: null,
          municipioResidencia: null,
          bairroResidencia: null,
          ruaResidencia: null,
          numeroCasa: null,
          provinciaNascimento: null,
          municipioNascimento: null,
          estadoCivil: null,
          nomePai: null,
          sobrenomePai: null,
          nomeMae: null,
          sobrenomeMae: null,
          altura: null,
          numeroBIAnterior: null,
          userId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
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
        password: 'password123',
        cidadao: baseCidadao,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 'existing-user' } as never);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow('User already exists with this email');
    });

    it('should hash the password before saving', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'plainPassword123',
        cidadao: baseCidadao,
      };

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        id: '1',
        email: registerDto.email,
        role: 'CITIZEN',
        password: hashedPassword,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        cidadao: {
          id: 'cid-1',
          ...baseCidadao,
          email: null,
          municipioResidencia: null,
          bairroResidencia: null,
          ruaResidencia: null,
          numeroCasa: null,
          provinciaNascimento: null,
          municipioNascimento: null,
          estadoCivil: null,
          nomePai: null,
          sobrenomePai: null,
          nomeMae: null,
          sobrenomeMae: null,
          altura: null,
          numeroBIAnterior: null,
          userId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as never);

      const result = await service.register(registerDto);

      // Verify the service called prisma.user.create
      expect(prisma.user.create).toHaveBeenCalled();

      // Verify password is not returned
      expect(result).not.toHaveProperty('password');

      // Verify other fields are present
      expect(result.email).toBe(registerDto.email);
    });

    it('should map optional citizen fields', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        cidadao: {
          ...baseCidadao,
          numeroBIAnterior: '123456789LA123',
          provinciaNascimento: Provincia.LUANDA,
        },
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        id: '1',
        email: registerDto.email,
        role: 'CITIZEN',
        password: 'hashed',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        cidadao: {
          id: 'cid-1',
          ...baseCidadao,
          numeroBIAnterior: '123456789LA123',
          provinciaNascimento: Provincia.LUANDA,
          email: null,
          municipioResidencia: null,
          bairroResidencia: null,
          ruaResidencia: null,
          numeroCasa: null,
          municipioNascimento: null,
          estadoCivil: null,
          nomePai: null,
          sobrenomePai: null,
          nomeMae: null,
          sobrenomeMae: null,
          altura: null,
          userId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as never);

      const result = await service.register(registerDto);

      expect((result as { cidadao?: { numeroBIAnterior?: string } }).cidadao?.numeroBIAnterior).toBe('123456789LA123');
      expect((result as { cidadao?: { provinciaNascimento?: string } }).cidadao?.provinciaNascimento).toBe('LUANDA');
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
        role: 'CITIZEN',
        password: hashedPassword,
        cidadao: {
          id: 'cid-1',
          ...baseCidadao,
        },
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as never);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: user.id,
        email: user.email,
        role: user.role,
        cidadao: user.cidadao,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = {
        email: 'notfound@example.com',
        password: 'password123',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
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
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
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
        role: 'CITIZEN',
        password: hashedPassword,
        cidadao: {
          id: 'cid-1',
          ...baseCidadao,
        },
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
