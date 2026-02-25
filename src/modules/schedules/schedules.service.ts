import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateScheduleDto } from './dtos/create-agendamento.dto';
import { UpdateScheduleDto } from './dtos/update-agendamento.dto';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createScheduleDto: CreateScheduleDto) {
    return this.prisma.schedule.create({
      data: {
        ...createScheduleDto,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        center: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.schedule.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        center: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.schedule.findMany({
      where: { userId },
      include: {
        center: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findByCenter(centerId: string) {
    return this.prisma.schedule.findMany({
      where: { centerId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.schedule.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        center: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    return this.prisma.schedule.update({
      where: { id },
      data: updateScheduleDto,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        center: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async cancel(id: string) {
    return this.prisma.schedule.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async delete(id: string) {
    return this.prisma.schedule.delete({
      where: { id },
    });
  }
}
