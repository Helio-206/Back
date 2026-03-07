import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class TipoServicoService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tipoServico.findMany({
      orderBy: {
        descricao: 'asc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.tipoServico.findUnique({
      where: { id },
    });
  }
}
