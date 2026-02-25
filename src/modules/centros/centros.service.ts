import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateCentroDto } from './dtos/create-centro.dto';
import { UpdateCentroDto } from './dtos/update-centro.dto';

@Injectable()
export class CentrosService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCentroDto: CreateCentroDto) {
    return this.prisma.centro.create({
      data: {
        ...createCentroDto,
        userId,
      },
    });
  }

  async findAll() {
    return this.prisma.centro.findMany({
      include: {
        user: {
          select: { id: true, email: true, nome: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.centro.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, nome: true },
        },
        agendamentos: true,
      },
    });
  }

  async update(id: string, updateCentroDto: UpdateCentroDto) {
    return this.prisma.centro.update({
      where: { id },
      data: updateCentroDto,
    });
  }

  async deactivate(id: string) {
    return this.prisma.centro.update({
      where: { id },
      data: { ativo: false },
    });
  }
}
