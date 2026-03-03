import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class ScheduleAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const scheduleId = request.params.id;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // ADMIN has full access
    if (user.role === 'ADMIN') {
      return true;
    }

    // Get the schedule
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        center: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    // CITIZEN can only access their own schedules
    if (user.role === 'CITIZEN') {
      if (schedule.userId !== user.id) {
        throw new ForbiddenException('You can only access your own schedules');
      }
      return true;
    }

    // CENTER can only access schedules of their center
    if (user.role === 'CENTER') {
      const userCenter = await this.prisma.center.findFirst({
        where: { userId: user.id },
      });

      if (!userCenter || schedule.centerId !== userCenter.id) {
        throw new ForbiddenException('You can only access schedules of your center');
      }
      return true;
    }

    throw new ForbiddenException('You do not have permission to access this resource');
  }
}
