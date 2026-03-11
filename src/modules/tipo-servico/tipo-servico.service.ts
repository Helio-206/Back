import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async create(descricao: string) {
    const existing = await this.prisma.tipoServico.findUnique({
      where: { descricao },
    });
    if (existing) {
      throw new BadRequestException('Um tipo de serviço com esta descrição já existe.');
    }
    return this.prisma.tipoServico.create({
      data: { descricao },
    });
  }

  async update(id: string, descricao: string) {
    const existing = await this.prisma.tipoServico.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`TipoServico com ID ${id} não encontrado.`);
    }
    return this.prisma.tipoServico.update({
      where: { id },
      data: { descricao },
    });
  }

  async toggleActive(id: string) {
    const existing = await this.prisma.tipoServico.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`TipoServico com ID ${id} não encontrado.`);
    }
    return this.prisma.tipoServico.update({
      where: { id },
      data: { active: !existing.active },
    });
  }
}
