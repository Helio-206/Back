import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@database/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserAlreadyExistsException, InvalidCredentialsException } from '@common/exceptions';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

interface AuthPayload {
  sub: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Register a new user with email, password, and personal information
   * @param registerDto User registration data
   * @returns User profile without password
   * @throws UserAlreadyExistsException if email already registered
   */
  async register(registerDto: RegisterDto) {
    const { email, password, name, numeroBIAnterior } = registerDto;

    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new UserAlreadyExistsException(email);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        numeroBIAnterior,
        role: 'CITIZEN',
        active: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Authenticate user with email and password
   * @param loginDto User credentials
   * @returns JWT access token and user profile
   * @throws InvalidCredentialsException if credentials invalid
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        active: true,
      },
    });

    if (!user || !user.active) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.comparePasswords(password, user.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const payload: AuthPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Validate if a user exists and is active
   * @param userId User ID
   * @returns User profile if exists, null otherwise
   */
  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
      },
    });

    return user?.active ? user : null;
  }

  /**
   * Compare plain text password with hashed password
   * @param plainPassword Password to verify
   * @param hashedPassword Stored hashed password
   * @returns true if passwords match
   */
  private async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
