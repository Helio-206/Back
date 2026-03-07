import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    const {
      email,
      password,
      role,
      cidadao,
    } = registerDto;

    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new ConflictException('Utilizador já existe com este email');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role ?? 'CITIZEN',
        cidadao: {
          create: {
            nome: cidadao.nome,
            sobrenome: cidadao.sobrenome,
            dataNascimento: new Date(cidadao.dataNascimento),
            sexo: cidadao.sexo,
            email: cidadao.email,
            provinciaResidencia: cidadao.provinciaResidencia,
            municipioResidencia: cidadao.municipioResidencia,
            bairroResidencia: cidadao.bairroResidencia,
            ruaResidencia: cidadao.ruaResidencia,
            numeroCasa: cidadao.numeroCasa,
            provinciaNascimento: cidadao.provinciaNascimento,
            municipioNascimento: cidadao.municipioNascimento,
            estadoCivil: cidadao.estadoCivil,
            nomePai: cidadao.nomePai,
            sobrenomePai: cidadao.sobrenomePai,
            nomeMae: cidadao.nomeMae,
            sobrenomeMae: cidadao.sobrenomeMae,
            altura: cidadao.altura,
            numeroBIAnterior: cidadao.numeroBIAnterior,
          },
        },
      },
      include: {
        cidadao: true,
      },
    });

    const { password: removedPassword, ...userWithoutPassword } = user;
    void removedPassword;
    return userWithoutPassword;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { cidadao: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        cidadao: user.cidadao,
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        role: true,
        cidadao: true,
      },
    });
  }
}
