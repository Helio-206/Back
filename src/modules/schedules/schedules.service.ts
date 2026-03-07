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

    // Validate estadoAgendamento exists
    const estadoAgendamento = await this.prisma.estadoAgendamento.findUnique({
      where: { id: createScheduleDto.estadoAgendamentoId },
    });

    if (!estadoAgendamento) {
      throw new NotFoundException(
        `EstadoAgendamento with ID ${createScheduleDto.estadoAgendamentoId} not found`
      );
    }

    // Validate tipoServico if provided
    if (createScheduleDto.tipoServicoId) {
      const tipoServico = await this.prisma.tipoServico.findUnique({
        where: { id: createScheduleDto.tipoServicoId },
      });

      if (!tipoServico) {
        throw new NotFoundException(`TipoServico with ID ${createScheduleDto.tipoServicoId} not found`);
      }
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
        estadoAgendamento: {
          status: {
            in: ['AGENDADO', 'CONFIRMADO'],
          },
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
          select: { id: true, email: true },
          include: { cidadao: true },
        },
        center: {
          select: { id: true, name: true },
        },
        tipoServico: true,
        estadoAgendamento: true,
      },
    });
  }

  async findAll() {
    return this.prisma.schedule.findMany({
      include: {
        user: {
          select: { id: true, email: true },
          include: { cidadao: true },
        },
        center: {
          select: { id: true, name: true },
        },
        tipoServico: true,
        estadoAgendamento: true,
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
        tipoServico: true,
        estadoAgendamento: true,
      },
    });
  }

  async findByCenter(centerId: string) {
    return this.prisma.schedule.findMany({
      where: { centerId },
      include: {
        user: {
          select: { id: true, email: true },
          include: { cidadao: true },
        },
        tipoServico: true,
        estadoAgendamento: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.schedule.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true },
          include: { cidadao: true },
        },
        center: {
          select: { id: true, name: true },
        },
        tipoServico: true,
        estadoAgendamento: true,
      },
    });
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    const current = await this.prisma.schedule.findUnique({
      where: { id },
      include: { estadoAgendamento: true },
    });

    if (!current) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    // Validate status transition when estadoAgendamentoId is updated
    if (updateScheduleDto.estadoAgendamentoId && updateScheduleDto.estadoAgendamentoId !== current.estadoAgendamentoId) {
      const newEstado = await this.prisma.estadoAgendamento.findUnique({
        where: { id: updateScheduleDto.estadoAgendamentoId },
      });

      if (!newEstado) {
        throw new NotFoundException(
          `EstadoAgendamento with ID ${updateScheduleDto.estadoAgendamentoId} not found`
        );
      }

      this.validateStatusTransition(current.estadoAgendamento.status, newEstado.status);
    }

    return this.prisma.schedule.update({
      where: { id },
      data: updateScheduleDto,
      include: {
        user: {
          select: { id: true, email: true },
          include: { cidadao: true },
        },
        center: {
          select: { id: true, name: true },
        },
        tipoServico: true,
        estadoAgendamento: true,
      },
    });
  }

  async cancel(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: { estadoAgendamento: true },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    if (schedule.estadoAgendamento.status === 'RETIRADO' || schedule.estadoAgendamento.status === 'CANCELADO') {
      throw new BadRequestException('Cannot cancel a completed or already cancelled schedule');
    }

    // Find the CANCELADO state
    const canceladoEstado = await this.prisma.estadoAgendamento.findFirst({
      where: { status: 'CANCELADO' },
    });

    if (!canceladoEstado) {
      throw new Error('CANCELADO state not found in database');
    }

    return this.prisma.schedule.update({
      where: { id },
      data: { estadoAgendamentoId: canceladoEstado.id },
    });
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      AGENDADO: ['CONFIRMADO', 'CANCELADO'],
      CONFIRMADO: ['BIOMETRIA_RECOLHIDA', 'CANCELADO'],
      BIOMETRIA_RECOLHIDA: ['EM_PROCESSAMENTO', 'CANCELADO'],
      EM_PROCESSAMENTO: ['PRONTO_RETIRADA', 'REJEITADO'],
      PRONTO_RETIRADA: ['RETIRADO'],
      RETIRADO: [],
      REJEITADO: [],
      CANCELADO: [],
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
