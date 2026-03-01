import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class ProtocoloService {
  constructor(private readonly prisma: PrismaService) {}

  async findByNumber(numeroProtocolo: string) {
    const protocolo = await this.prisma.protocolo.findUnique({
      where: { numeroProtocolo },
      include: {
        schedule: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            center: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!protocolo) {
      throw new NotFoundException(`Protocolo ${numeroProtocolo} não encontrado`);
    }

    return protocolo;
  }

  async findBySchedule(scheduleId: string) {
    return this.prisma.protocolo.findFirst({
      where: { scheduleId },
      include: {
        schedule: {
          select: { id: true, scheduledDate: true, status: true },
        },
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.protocolo.findMany({
      where: {
        schedule: { userId },
      },
      include: {
        schedule: {
          select: {
            id: true,
            scheduledDate: true,
            status: true,
            biStatus: true,
          },
        },
      },
      orderBy: { registradoEm: 'desc' },
    });
  }

  async updateStatus(protocoloId: string, statusAtual: string) {
    const protocolo = await this.prisma.protocolo.findUnique({
      where: { id: protocoloId },
    });

    if (!protocolo) {
      throw new NotFoundException('Protocolo não encontrado');
    }

    return this.prisma.protocolo.update({
      where: { id: protocoloId },
      data: {
        statusAnterior: protocolo.statusAtual as any,
        statusAtual: statusAtual as any,
        processadoEm: new Date(),
      },
      include: { schedule: { select: { id: true } } },
    });
  }
}
