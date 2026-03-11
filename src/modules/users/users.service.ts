import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        cidadao: {
          select: {
            nome: true,
            sobrenome: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        cidadao: {
          select: {
            id: true,
            nome: true,
            sobrenome: true,
            dataNascimento: true,
            sexo: true,
            email: true,
            provinciaResidencia: true,
            municipioResidencia: true,
            bairroResidencia: true,
            ruaResidencia: true,
            numeroCasa: true,
            provinciaNascimento: true,
            municipioNascimento: true,
            estadoCivil: true,
            nomePai: true,
            sobrenomePai: true,
            nomeMae: true,
            sobrenomeMae: true,
            altura: true,
            numeroBIAnterior: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async deactivate(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { active: false },
      select: { id: true, email: true, active: true },
    });
  }

  async updateMyProfile(
    userId: string,
    data: {
      email?: string;
      nome?: string;
      sobrenome?: string;
      sexo?: string;
      provinciaResidencia?: string;
      municipioResidencia?: string;
      bairroResidencia?: string;
      ruaResidencia?: string;
      numeroCasa?: string;
      estadoCivil?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, cidadao: { select: { id: true } } },
    });

    if (!user) throw new NotFoundException('User not found');
    if (!user.cidadao) throw new BadRequestException('User has no citizen profile');

    // Update user email if provided
    if (data.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Email already in use');
      }
      await this.prisma.user.update({
        where: { id: userId },
        data: { email: data.email },
      });
    }

    // Update cidadao fields
    const cidadaoUpdate: Record<string, unknown> = {};
    if (data.nome) cidadaoUpdate.nome = data.nome;
    if (data.sobrenome) cidadaoUpdate.sobrenome = data.sobrenome;
    if (data.sexo) cidadaoUpdate.sexo = data.sexo;
    if (data.provinciaResidencia) cidadaoUpdate.provinciaResidencia = data.provinciaResidencia;
    if (data.municipioResidencia !== undefined) cidadaoUpdate.municipioResidencia = data.municipioResidencia;
    if (data.bairroResidencia !== undefined) cidadaoUpdate.bairroResidencia = data.bairroResidencia;
    if (data.ruaResidencia !== undefined) cidadaoUpdate.ruaResidencia = data.ruaResidencia;
    if (data.numeroCasa !== undefined) cidadaoUpdate.numeroCasa = data.numeroCasa;
    if (data.estadoCivil !== undefined) cidadaoUpdate.estadoCivil = data.estadoCivil;

    if (Object.keys(cidadaoUpdate).length > 0) {
      await this.prisma.cidadao.update({
        where: { userId },
        data: cidadaoUpdate,
      });
    }

    // Return updated user with full cidadao
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        cidadao: {
          select: {
            id: true,
            nome: true,
            sobrenome: true,
            dataNascimento: true,
            sexo: true,
            email: true,
            provinciaResidencia: true,
            municipioResidencia: true,
            bairroResidencia: true,
            ruaResidencia: true,
            numeroCasa: true,
            estadoCivil: true,
            numeroBIAnterior: true,
          },
        },
      },
    });
  }

  async updateMyBi(userId: string, numeroBIAnterior: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        cidadao: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.cidadao) {
      throw new BadRequestException('User has no citizen profile');
    }

    return this.prisma.cidadao.update({
      where: { userId },
      data: { numeroBIAnterior },
      select: {
        id: true,
        numeroBIAnterior: true,
        nome: true,
        sobrenome: true,
      },
    });
  }
}
