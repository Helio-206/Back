import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createScheduleDto: CreateScheduleDto) {
    // Validate that center exists
    const center = await this.prisma.center.findUnique({
      where: { id: createScheduleDto.centerId },
    });

    if (!center) {
      throw new NotFoundException(`Center with ID ${createScheduleDto.centerId} not found`);
    }

    // Validate that scheduled date is in the future
    const scheduledDate = new Date(createScheduleDto.scheduledDate);
    if (scheduledDate <= new Date()) {
      throw new BadRequestException('Scheduled date must be in the future');
    }

    // Check for duplicate schedules (same user, center, and date)
    const existingSchedule = await this.prisma.schedule.findFirst({
      where: {
        userId,
        centerId: createScheduleDto.centerId,
        scheduledDate: createScheduleDto.scheduledDate,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    if (existingSchedule) {
      throw new ConflictException('You already have a schedule for this center on this date');
    }

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
    const current = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!current) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    // Validate status transition if status is being updated
    if (updateScheduleDto.status && updateScheduleDto.status !== current.status) {
      this.validateStatusTransition(current.status, updateScheduleDto.status);
    }

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
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    if (schedule.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed schedule');
    }

    return this.prisma.schedule.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  async delete(id: string) {
    return this.prisma.schedule.delete({
      where: { id },
    });
  }
}
