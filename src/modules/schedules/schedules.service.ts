import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';
import { NotificationsService } from '@modules/notifications/notifications.service';
import { ActivityLogService } from '@modules/activity-log/activity-log.service';

@Injectable()
export class SchedulesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private activityLogService: ActivityLogService,
  ) {}

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
          select: { id: true, email: true, cidadao: true },
        },
        center: {
          select: { id: true, name: true, provincia: true },
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
          select: { id: true, email: true, cidadao: true },
        },
        center: {
          select: { id: true, name: true, provincia: true },
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
          select: { id: true, email: true, cidadao: true },
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
          select: { id: true, email: true, cidadao: true },
        },
        center: {
          select: { id: true, name: true, provincia: true },
        },
        tipoServico: true,
        estadoAgendamento: true,
      },
    });
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto, performedByUserId?: string) {
    const current = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        estadoAgendamento: true,
        center: { select: { name: true } },
        tipoServico: { select: { descricao: true } },
      },
    });

    if (!current) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    // Validate status transition when estadoAgendamentoId is updated
    let newEstado: { id: string; status: string; descricao: string } | null = null;
    if (updateScheduleDto.estadoAgendamentoId && updateScheduleDto.estadoAgendamentoId !== current.estadoAgendamentoId) {
      newEstado = await this.prisma.estadoAgendamento.findUnique({
        where: { id: updateScheduleDto.estadoAgendamentoId },
      });

      if (!newEstado) {
        throw new NotFoundException(
          `EstadoAgendamento with ID ${updateScheduleDto.estadoAgendamentoId} not found`
        );
      }

      this.validateStatusTransition(current.estadoAgendamento.status, newEstado.status);
    }

    const updated = await this.prisma.schedule.update({
      where: { id },
      data: updateScheduleDto,
      include: {
        user: {
          select: { id: true, email: true, cidadao: true },
        },
        center: {
          select: { id: true, name: true, provincia: true },
        },
        tipoServico: true,
        estadoAgendamento: true,
      },
    });

    // Auto-create notification on status change
    if (newEstado) {
      const statusMessages: Record<string, { title: string; message: string; type: string }> = {
        CONFIRMADO: {
          title: 'Agendamento Aceite',
          message: `O seu agendamento no centro "${current.center?.name}" foi aceite. Pode comparecer no centro na data marcada para ser atendido(a).`,
          type: 'CONFIRMATION',
        },
        EM_PROCESSAMENTO: {
          title: 'BI em Processamento',
          message: `O seu Bilhete de Identidade está a ser processado.`,
          type: 'STATUS_CHANGE',
        },
        PRONTO_RETIRADA: {
          title: 'BI Pronto para Retirada',
          message: `O seu Bilhete de Identidade está pronto para retirada no centro "${current.center?.name}".`,
          type: 'CONFIRMATION',
        },
        CONCLUIDO: {
          title: 'Atendimento Concluído',
          message: `O seu atendimento no centro "${current.center?.name}" foi concluído com sucesso.`,
          type: 'INFO',
        },
        REJEITADO: {
          title: 'Agendamento Rejeitado',
          message: `O seu agendamento no centro "${current.center?.name}" foi rejeitado. Por favor, entre em contacto com o centro.`,
          type: 'REJECTION',
        },
        CANCELADO: {
          title: 'Agendamento Cancelado',
          message: `O seu agendamento no centro "${current.center?.name}" foi cancelado.`,
          type: 'REJECTION',
        },
      };

      const msgData = statusMessages[newEstado.status];
      if (msgData) {
        try {
          await this.notificationsService.create({
            userId: current.userId,
            title: msgData.title,
            message: msgData.message,
            type: msgData.type,
            scheduleId: id,
          });
        } catch {
          // Don't fail the update if notification fails
        }
      }
    }

    // Auto-log status change
    if (newEstado && performedByUserId) {
      this.activityLogService.log({
        userId: performedByUserId,
        action: `STATUS_${newEstado.status}`,
        entity: 'Schedule',
        entityId: id,
        details: `Status alterado de ${current.estadoAgendamento.status} para ${newEstado.status}`,
      });
    }

    return updated;
  }

  async cancel(id: string, performedByUserId?: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        estadoAgendamento: true,
        center: { select: { name: true } },
      },
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

    const updated = await this.prisma.schedule.update({
      where: { id },
      data: { estadoAgendamentoId: canceladoEstado.id },
    });

    // Create cancellation notification
    try {
      await this.notificationsService.create({
        userId: schedule.userId,
        title: 'Agendamento Cancelado',
        message: `O seu agendamento no centro "${schedule.center?.name}" foi cancelado.`,
        type: 'REJECTION',
        scheduleId: id,
      });
    } catch {
      // Don't fail if notification fails
    }

    // Log the cancellation
    if (performedByUserId) {
      this.activityLogService.log({
        userId: performedByUserId,
        action: 'STATUS_CANCELADO',
        entity: 'Schedule',
        entityId: id,
        details: `Agendamento cancelado`,
      });
    }

    return updated;
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      AGENDADO: ['CONFIRMADO', 'CANCELADO', 'REJEITADO'],
      CONFIRMADO: ['CONCLUIDO', 'CANCELADO', 'REJEITADO'],
      EM_PROCESSAMENTO: ['PRONTO_RETIRADA', 'CONCLUIDO', 'REJEITADO'],
      PRONTO_RETIRADA: ['CONCLUIDO'],
      CONCLUIDO: [],
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
