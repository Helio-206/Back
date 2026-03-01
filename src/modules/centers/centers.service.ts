import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Provincia } from '@prisma/client';
import { CreateCenterDto } from './dtos/create-center.dto';
import { UpdateCenterDto } from './dtos/update-center.dto';

interface CenterFilterOptions {
  provincia?: Provincia;
  type?: string;
  active?: boolean;
}

/**
 * Centers service managing BI appointment centers and their operations
 */
@Injectable()
export class CentersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new center (center manager only)
   * @param userId User ID of center manager
   * @param createCenterDto Center creation data
   * @returns Created center
   * @throws ConflictException if user already has a center
   */
  async create(userId: string, createCenterDto: CreateCenterDto) {
    const userHasCenter = await this.prisma.center.findUnique({
      where: { userId },
    });

    if (userHasCenter) {
      throw new ConflictException(
        'Este usuário já gerencia um centro. Um usuário pode gerenciar apenas um centro.'
      );
    }

    const center = await this.prisma.center.create({
      data: {
        ...createCenterDto,
        userId,
        active: true,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return center;
  }

  /**
   * Get all centers with optional filtering
   * @param filters Optional filter options (provincia, type, active)
   * @returns Array of centers matching filters
   */
  async findAll(filters?: CenterFilterOptions) {
    return this.prisma.center.findMany({
      where: {
        ...(filters?.provincia && { provincia: filters.provincia }),
        ...(filters?.type && { type: filters.type as any }),
        ...(filters?.active !== undefined && { active: filters.active }),
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        _count: {
          select: { schedules: true },
        },
      },
      orderBy: [{ provincia: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Get center by ID with full details
   * @param id Center ID
   * @returns Center details with schedules count
   * @throws NotFoundException if center doesn't exist
   */
  async findOne(id: string) {
    const center = await this.prisma.center.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        schedules: {
          select: {
            id: true,
            scheduledDate: true,
            status: true,
            biStatus: true,
          },
          orderBy: { scheduledDate: 'desc' },
          take: 10,
        },
        _count: {
          select: { schedules: true },
        },
      },
    });

    if (!center) {
      throw new NotFoundException(`Centro com ID ${id} não encontrado`);
    }

    return center;
  }

  /**
   * Get center by user ID (center manager)
   * @param userId User ID of center manager
   * @returns User's center or null
   */
  async findByUserId(userId: string) {
    return this.prisma.center.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        _count: {
          select: { schedules: true },
        },
      },
    });
  }

  /**
   * Get centers by province
   * @param provincia Province code
   * @returns Array of centers in specified province
   */
  async findByProvincia(provincia: Provincia) {
    return this.prisma.center.findMany({
      where: { provincia, active: true },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        _count: {
          select: { schedules: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Update center details
   * @param id Center ID
   * @param updateCenterDto Updated center data
   * @returns Updated center
   * @throws NotFoundException if center doesn't exist
   * @throws BadRequestException if invalid update
   */
  async update(id: string, updateCenterDto: UpdateCenterDto) {
    const centerExists = await this.prisma.center.findUnique({
      where: { id },
    });

    if (!centerExists) {
      throw new NotFoundException(`Centro com ID ${id} não encontrado`);
    }

    // Validate time format if provided
    if (updateCenterDto.openingTime && updateCenterDto.closingTime) {
      const open = updateCenterDto.openingTime.split(':').map(Number);
      const close = updateCenterDto.closingTime.split(':').map(Number);
      const openMinutes = open[0] * 60 + open[1];
      const closeMinutes = close[0] * 60 + close[1];

      if (closeMinutes <= openMinutes) {
        throw new BadRequestException(
          'Horário de fechamento deve ser depois do horário de abertura'
        );
      }
    }

    const updatedCenter = await this.prisma.center.update({
      where: { id },
      data: updateCenterDto,
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        _count: {
          select: { schedules: true },
        },
      },
    });

    return updatedCenter;
  }

  /**
   * Get available appointment slots for a center and date
   * @param centerId Center ID
   * @param date Date to check
   * @returns Number of available slots
   */
  async getAvailableSlots(centerId: string, date: Date): Promise<number> {
    const center = await this.prisma.center.findUnique({
      where: { id: centerId },
      select: { capacidadeAgentos: true },
    });

    if (!center) {
      throw new NotFoundException(`Centro com ID ${centerId} não encontrado`);
    }

    const scheduledCount = await this.prisma.schedule.count({
      where: {
        centerId,
        scheduledDate: {
          gte: new Date(date.toDateString()),
          lt: new Date(new Date(date).setDate(date.getDate() + 1).toString()),
        },
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
        },
      },
    });

    return Math.max(0, center.capacidadeAgentos - scheduledCount);
  }

  /**
   * Deactivate center (soft delete)
   * @param id Center ID
   * @returns Deactivation result
   * @throws NotFoundException if center doesn't exist
   */
  async deactivate(id: string) {
    const centerExists = await this.prisma.center.findUnique({
      where: { id },
    });

    if (!centerExists) {
      throw new NotFoundException(`Centro com ID ${id} não encontrado`);
    }

    return this.prisma.center.update({
      where: { id },
      data: { active: false },
      select: {
        id: true,
        name: true,
        active: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Delete center permanently (admin only)
   * @param id Center ID
   * @throws NotFoundException if center doesn't exist
   * @throws BadRequestException if center has future schedules
   */
  async delete(id: string) {
    const center = await this.prisma.center.findUnique({
      where: { id },
      include: {
        schedules: {
          where: {
            scheduledDate: {
              gte: new Date(),
            },
          },
          take: 1,
        },
      },
    });

    if (!center) {
      throw new NotFoundException(`Centro com ID ${id} não encontrado`);
    }

    if (center.schedules.length > 0) {
      throw new BadRequestException(
        'Não é possível deletar um centro com agendamentos futuros. Reschedule todos os agendamentos primeiro.'
      );
    }

    return this.prisma.center.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }

  /**
   * Get center statistics
   * @param id Center ID
   * @returns Center statistics (total schedules, by status, etc)
   */
  async getStatistics(id: string) {
    const center = await this.prisma.center.findUnique({
      where: { id },
    });

    if (!center) {
      throw new NotFoundException(`Centro com ID ${id} não encontrado`);
    }

    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      this.prisma.schedule.count({ where: { centerId: id } }),
      this.prisma.schedule.count({
        where: { centerId: id, status: 'PENDING' },
      }),
      this.prisma.schedule.count({
        where: { centerId: id, status: 'CONFIRMED' },
      }),
      this.prisma.schedule.count({
        where: { centerId: id, status: 'COMPLETED' },
      }),
      this.prisma.schedule.count({
        where: { centerId: id, status: 'CANCELLED' },
      }),
    ]);

    return {
      centerId: id,
      totalSchedules: total,
      byStatus: { pending, confirmed, completed, cancelled },
      capacity: center.capacidadeAgentos,
    };
  }
}
