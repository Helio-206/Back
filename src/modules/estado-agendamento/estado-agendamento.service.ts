import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class EstadoAgendamentoService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.estadoAgendamento.findMany({
      orderBy: {
        descricao: 'asc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.estadoAgendamento.findUnique({
      where: { id },
    });
  }
}
