import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateAgendamentoDto } from './dtos/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dtos/update-agendamento.dto';

@Injectable()
export class AgendamentosService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createAgendamentoDto: CreateAgendamentoDto) {
    return this.prisma.agendamento.create({
      data: {
        ...createAgendamentoDto,
        userId,
      },
      include: {
        user: {
          select: { id: true, nome: true, email: true },
        },
        centro: {
          select: { id: true, nome: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.agendamento.findMany({
      include: {
        user: {
          select: { id: true, nome: true, email: true },
        },
        centro: {
          select: { id: true, nome: true },
        },
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.agendamento.findMany({
      where: { userId },
      include: {
        centro: {
          select: { id: true, nome: true },
        },
      },
    });
  }

  async findByCentro(centroId: string) {
    return this.prisma.agendamento.findMany({
      where: { centroId },
      include: {
        user: {
          select: { id: true, nome: true, email: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.agendamento.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, nome: true, email: true },
        },
        centro: {
          select: { id: true, nome: true },
        },
      },
    });
  }

  async update(id: string, updateAgendamentoDto: UpdateAgendamentoDto) {
    return this.prisma.agendamento.update({
      where: { id },
      data: updateAgendamentoDto,
      include: {
        user: {
          select: { id: true, nome: true, email: true },
        },
        centro: {
          select: { id: true, nome: true },
        },
      },
    });
  }

  async cancel(id: string) {
    return this.prisma.agendamento.update({
      where: { id },
      data: { status: 'CANCELADO' },
    });
  }

  async delete(id: string) {
    return this.prisma.agendamento.delete({
      where: { id },
    });
  }
}
