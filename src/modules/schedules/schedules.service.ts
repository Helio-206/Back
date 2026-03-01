import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { InvalidScheduleException } from '@common/exceptions';
import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';
import { ScheduleStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create new appointment with comprehensive validation
   * @param userId User ID requesting schedule
   * @param createScheduleDto Schedule creation data
   * @returns Created schedule with protocol number
   * @throws InvalidScheduleException if validation fails
   */
  async create(userId: string, createScheduleDto: CreateScheduleDto) {
    const { centerId, scheduledDate, tipoBI, slotNumber, description, notes } = createScheduleDto;

    const center = await this.prisma.center.findUnique({
      where: { id: centerId },
    });

    if (!center) {
      throw new NotFoundException(`Centro com ID ${centerId} não encontrado`);
    }

    const scheduleDateTime = new Date(scheduledDate);
    this.validateScheduleDateTime(scheduleDateTime, center);

    const existingSchedule = await this.prisma.schedule.findFirst({
      where: {
        userId,
        centerId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (existingSchedule) {
      throw InvalidScheduleException.duplicateSchedule();
    }

    const availableSlots = await this.getAvailableSlots(centerId, scheduleDateTime);
    if (availableSlots <= 0) {
      throw InvalidScheduleException.noAvailableSlots(scheduleDateTime.toLocaleDateString('pt-AO'));
    }

    const numeroProtocolo = this.generateProtocolNumber();

    const schedule = await this.prisma.schedule.create({
      data: {
        userId,
        centerId,
        scheduledDate: scheduleDateTime,
        tipoBI,
        slotNumber: slotNumber || (await this.getNextSlotNumber(centerId)),
        description,
        notes,
        status: 'PENDING',
        biStatus: 'AGENDADO',
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

    await this.prisma.protocolo.create({
      data: {
        numeroProtocolo,
        scheduleId: schedule.id,
        statusAnterior: 'AGENDADO',
        statusAtual: 'AGENDADO',
      },
    });

    return this.enrichScheduleWithProtocol(schedule.id);
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
        protocolo: {
          select: { numeroProtocolo: true, statusAtual: true },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    });
  }

  /**
   * Get schedules for authenticated user
   * @param userId User ID
   * @returns User's schedules
   */
  async findByUser(userId: string) {
    return this.prisma.schedule.findMany({
      where: { userId },
      include: {
        center: {
          select: { id: true, name: true, provincia: true },
        },
        protocolo: {
          select: { numeroProtocolo: true, statusAtual: true },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    });
  }

  /**
   * Get schedules by center
   * @param centerId Center ID
   * @returns Center's schedules
   */
  async findByCenter(centerId: string) {
    const centerExists = await this.prisma.center.findUnique({
      where: { id: centerId },
    });

    if (!centerExists) {
      throw new NotFoundException(`Centro com ID ${centerId} não encontrado`);
    }

    return this.prisma.schedule.findMany({
      where: { centerId },
      include: {
        user: {
          select: { id: true, name: true, email: true, numeroBIAnterior: true },
        },
        protocolo: {
          select: { numeroProtocolo: true, statusAtual: true },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  /**
   * Get schedule by ID
   * @param id Schedule ID
   * @returns Schedule with full details
   * @throws NotFoundException if not found
   */
  async findOne(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        center: {
          select: { id: true, name: true, provincia: true },
        },
        documents: true,
        protocolo: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
    }

    return schedule;
  }

  /**
   * Get schedule by protocol number
   * @param numeroProtocolo Protocol number
   * @returns Schedule if found
   */
  async findByProtocolNumber(numeroProtocolo: string) {
    return this.prisma.schedule.findFirst({
      where: {
        protocolo: { numeroProtocolo },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        center: {
          select: { id: true, name: true },
        },
        protocolo: true,
        documents: true,
      },
    });
  }

  /**
   * Update schedule details
   * @param id Schedule ID
   * @param updateScheduleDto Updated data
   * @returns Updated schedule
   * @throws NotFoundException if schedule not found
   */
  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
    }

    const updated = await this.prisma.schedule.update({
      where: { id },
      data: {
        ...(updateScheduleDto.description && {
          description: updateScheduleDto.description,
        }),
        ...(updateScheduleDto.notes && { notes: updateScheduleDto.notes }),
        ...(updateScheduleDto.biStatus && {
          biStatus: updateScheduleDto.biStatus,
        }),
      },
      include: {
        center: { select: { id: true, name: true } },
        protocolo: { select: { numeroProtocolo: true } },
      },
    });

    if (updateScheduleDto.biStatus && updateScheduleDto.biStatus !== schedule.biStatus) {
      await this.prisma.protocolo.update({
        where: { scheduleId: id },
        data: {
          statusAnterior: schedule.biStatus,
          statusAtual: updateScheduleDto.biStatus,
          processadoEm: new Date(),
        },
      });
    }

    return updated;
  }

  /**
   * Cancel schedule (soft delete)
   * @param id Schedule ID
   * @returns Cancellation result
   * @throws NotFoundException if schedule not found
   */
  async cancel(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
    }

    const cancelled = await this.prisma.schedule.update({
      where: { id },
      data: { status: 'CANCELLED' },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    await this.prisma.protocolo.update({
      where: { scheduleId: id },
      data: {
        statusAnterior: schedule.biStatus,
        statusAtual: 'CANCELADO',
      },
    });

    return cancelled;
  }

  /**
   * Delete schedule permanently (admin only)
   * @param id Schedule ID
   * @throws NotFoundException if schedule not found
   */
  async delete(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
    }

    return this.prisma.schedule.delete({
      where: { id },
      select: { id: true, status: true },
    });
  }

  /**
   * Get schedules by status
   * @param status Schedule status filter
   * @returns Schedules with given status
   */
  async findByStatus(status: ScheduleStatus) {
    return this.prisma.schedule.findMany({
      where: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        center: { select: { id: true, name: true } },
        protocolo: { select: { numeroProtocolo: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  /**
   * Get available appointment slots for center and date
   * @param centerId Center ID
   * @param date Target date
   * @returns Number of available slots
   */
  private async getAvailableSlots(centerId: string, date: Date): Promise<number> {
    const center = await this.prisma.center.findUnique({
      where: { id: centerId },
      select: { capacidadeAgentos: true },
    });

    if (!center) return 0;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const scheduledCount = await this.prisma.schedule.count({
      where: {
        centerId,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    return Math.max(0, center.capacidadeAgentos - scheduledCount);
  }

  /**
   * Get next available slot number for center on date
   * @param centerId Center ID
   * @returns Next slot number
   */
  private async getNextSlotNumber(centerId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSchedule = await this.prisma.schedule.findFirst({
      where: {
        centerId,
        scheduledDate: {
          gte: today,
        },
      },
      select: { slotNumber: true },
      orderBy: { slotNumber: 'desc' },
      take: 1,
    });

    return (lastSchedule?.slotNumber || 0) + 1;
  }

  /**
   * Validate schedule date and time against center operations
   * @param scheduleDate Scheduled date/time
   * @param center Center details
   * @throws InvalidScheduleException if validation fails
   */
  private validateScheduleDateTime(
    scheduleDate: Date,
    center: {
      openingTime: string;
      closingTime: string;
      attendanceDays: string;
    }
  ): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (scheduleDate < tomorrow) {
      throw InvalidScheduleException.tooSoon();
    }

    const dayOfWeek = scheduleDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw InvalidScheduleException.centerClosed('finais de semana');
    }

    const [openHour, openMin] = center.openingTime.split(':').map(Number);
    const [closeHour, closeMin] = center.closingTime.split(':').map(Number);

    const scheduleHour = scheduleDate.getHours();
    const scheduleMin = scheduleDate.getMinutes();

    const scheduleMinutes = scheduleHour * 60 + scheduleMin;
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    if (scheduleMinutes < openMinutes || scheduleMinutes >= closeMinutes) {
      throw InvalidScheduleException.outsideOperatingHours(center.openingTime, center.closingTime);
    }
  }

  /**
   * Generate unique protocol number (formato: Protocol-YYYYMM-XXXXXXXXXXXX)
   * @returns Generated protocol number
   */
  private generateProtocolNumber(): string {
    const now = new Date();
    const yearMonth = now.toISOString().substring(0, 7).replace('-', '');
    const randomPart = crypto.randomBytes(6).toString('hex').toUpperCase();
    return `PROT${yearMonth}${randomPart}`;
  }

  /**
   * Enrich schedule with protocol information
   * @param scheduleId Schedule ID
   * @returns Schedule with protocol data
   */
  private async enrichScheduleWithProtocol(scheduleId: string) {
    return this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        center: {
          select: { id: true, name: true },
        },
        protocolo: {
          select: {
            numeroProtocolo: true,
            statusAtual: true,
            registradoEm: true,
          },
        },
      },
    });
  }
}
