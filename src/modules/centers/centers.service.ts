import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateCenterDto } from './dtos/create-center.dto';
import { UpdateCenterDto } from './dtos/update-center.dto';
import { Prisma, Provincia } from '@prisma/client';

/**
 * CentersService - Gerencia todas as operações CRUD para centros
 * Inclui validações de horários de abertura/fechamento e dias de atendimento
 */
@Injectable()
export class CentersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Valida que o horário de abertura seja anterior ao horário de fechamento
   */
  private validateTimeRange(openingTime: string, closingTime: string): void {
    const opening = parseInt(openingTime.replace(':', ''), 10);
    const closing = parseInt(closingTime.replace(':', ''), 10);

    if (opening >= closing) {
      throw new BadRequestException(
        'Opening time must be before closing time',
      );
    }
  }

  /**
   * Valida o formato dos dias de atendimento
   */
  private validateAttendanceDays(days: string): void {
    const validDays = [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ];
    const providedDays = days.split(',');

    const allValid = providedDays.every((day) => validDays.includes(day));
    if (!allValid) {
      throw new BadRequestException(
        `Invalid attendance days. Use: ${validDays.join(', ')}`,
      );
    }

    if (providedDays.length === 0) {
      throw new BadRequestException('At least one attendance day is required');
    }
  }

  /**
   * Cria um novo centro (apenas disponível para usuários com papel CENTER)
   */
  async create(userId: string, createCenterDto: CreateCenterDto) {
    // Validate time range if both times provided
    const openingTime = createCenterDto.openingTime || '08:00';
    const closingTime = createCenterDto.closingTime || '17:00';
    this.validateTimeRange(openingTime, closingTime);

    // Validate attendance days if provided
    const attendanceDays =
      createCenterDto.attendanceDays || 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY';
    this.validateAttendanceDays(attendanceDays);

    // Check if user already has a center
    const existingCenter = await this.prisma.center.findUnique({
      where: { userId },
    });

    if (existingCenter) {
      throw new BadRequestException(
        'User already has a center. One center per user allowed.',
      );
    }

    try {
      return await this.prisma.center.create({
        data: {
          ...createCenterDto,
          openingTime,
          closingTime,
          attendanceDays,
          userId,
        },
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'A center with this data already exists',
          );
        }
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
      }
      throw error;
    }
  }

  /**
   * Busca todos os centros com filtros opcionais
   */
  async findAll(filters?: { provincia?: Provincia; active?: boolean }) {
    const where: Prisma.CenterWhereInput = {};

    if (filters?.provincia) {
      where.provincia = filters.provincia;
    }

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    return this.prisma.center.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Busca centros por província
   */
  async findByProvince(provincia: Provincia) {
    return this.prisma.center.findMany({
      where: { provincia, active: true },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Busca um único centro por ID com agendas
   */
  async findOne(id: string) {
    const center = await this.prisma.center.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        schedules: {
          orderBy: { scheduledDate: 'desc' },
          take: 10, // Return last 10 schedules
        },
      },
    });

    if (!center) {
      throw new NotFoundException(`Center with ID ${id} not found`);
    }

    return center;
  }

  /**
   * Atualiza um centro (atualizações parciais permitidas)
   */
  async update(id: string, updateCenterDto: UpdateCenterDto) {
    // Verify center exists
    const center = await this.prisma.center.findUnique({ where: { id } });
    if (!center) {
      throw new NotFoundException(`Center with ID ${id} not found`);
    }

    // Validate time range if times are being updated
    const openingTime = updateCenterDto.openingTime || center.openingTime;
    const closingTime = updateCenterDto.closingTime || center.closingTime;

    if (updateCenterDto.openingTime || updateCenterDto.closingTime) {
      this.validateTimeRange(openingTime, closingTime);
    }

    // Validate attendance days if being updated
    if (updateCenterDto.attendanceDays) {
      this.validateAttendanceDays(updateCenterDto.attendanceDays);
    }

    try {
      return await this.prisma.center.update({
        where: { id },
        data: updateCenterDto,
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'A center with this data already exists',
          );
        }
      }
      throw error;
    }
  }

  /**
   * Desativa um centro (soft delete)
   */
  async deactivate(id: string) {
    const center = await this.prisma.center.findUnique({ where: { id } });
    if (!center) {
      throw new NotFoundException(`Center with ID ${id} not found`);
    }

    return this.prisma.center.update({
      where: { id },
      data: { active: false },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  /**
   * Reativa um centro (reverte soft delete)
   */
  async reactivate(id: string) {
    const center = await this.prisma.center.findUnique({ where: { id } });
    if (!center) {
      throw new NotFoundException(`Center with ID ${id} not found`);
    }

    return this.prisma.center.update({
      where: { id },
      data: { active: true },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  /**
   * Exclui um centro permanentemente (hard delete)
   */
  async delete(id: string) {
    const center = await this.prisma.center.findUnique({ where: { id } });
    if (!center) {
      throw new NotFoundException(`Center with ID ${id} not found`);
    }

    try {
      await this.prisma.center.delete({
        where: { id },
      });
      return { message: 'Center deleted successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Center with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  /**
   * Obtém estatísticas de centros (para painel de administração)
   */
  async getStatistics() {
    const [total, active, byProvince] = await Promise.all([
      this.prisma.center.count(),
      this.prisma.center.count({ where: { active: true } }),
      this.prisma.center.groupBy({
        by: ['provincia'],
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      byProvince: byProvince.map((p) => ({
        province: p.provincia,
        count: p._count,
      })),
    };
  }
}
