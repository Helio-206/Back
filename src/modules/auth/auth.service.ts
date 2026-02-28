import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@database/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'CITIZEN',
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
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

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });
  }
}
