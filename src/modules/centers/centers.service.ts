import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateCenterDto } from './dtos/create-center.dto';
import { UpdateCenterDto } from './dtos/update-center.dto';

@Injectable()
export class CentersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCenterDto: CreateCenterDto) {
    return this.prisma.center.create({
      data: {
        ...createCenterDto,
        userId,
      },
    });
  }

  async findAll() {
    return this.prisma.center.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.center.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        schedules: true,
      },
    });
  }

  async update(id: string, updateCenterDto: UpdateCenterDto) {
    return this.prisma.center.update({
      where: { id },
      data: updateCenterDto,
    });
  }

  async deactivate(id: string) {
    return this.prisma.center.update({
      where: { id },
      data: { active: false },
    });
  }
}
