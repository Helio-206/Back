import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    details?: string;
    ipAddress?: string;
  }) {
    try {
      return await this.prisma.activityLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          details: data.details,
          ipAddress: data.ipAddress,
        },
      });
    } catch {
      // Don't fail operations if logging fails
      return null;
    }
  }

  async findAll(filters?: {
    action?: string;
    entity?: string;
    userId?: string;
    limit?: number;
  }) {
    const where: Record<string, unknown> = {};
    if (filters?.action) where.action = filters.action;
    if (filters?.entity) where.entity = filters.entity;
    if (filters?.userId) where.userId = filters.userId;

    return this.prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            cidadao: {
              select: { nome: true, sobrenome: true },
            },
          },
        },
      },
    });
  }

  async getStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalToday, totalWeek, totalAll, byAction] = await Promise.all([
      this.prisma.activityLog.count({ where: { createdAt: { gte: today } } }),
      this.prisma.activityLog.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.activityLog.count(),
      this.prisma.activityLog.groupBy({
        by: ['action'],
        _count: true,
        orderBy: { _count: { action: 'desc' } },
      }),
    ]);

    return {
      totalToday,
      totalWeek,
      totalAll,
      byAction: byAction.map((a) => ({ action: a.action, count: a._count })),
    };
  }
}
