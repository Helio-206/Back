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
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, senha, nome } = registerDto;

    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        nome,
        password: hashedPassword,
        role: 'CIDADAO',
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const { email, senha } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(senha, user.password))) {
      throw new Error('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role,
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, nome: true, role: true },
    });
  }
}
