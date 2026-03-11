import { Controller, Get, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ActivityLogController {
  constructor(private activityLogService: ActivityLogService) {}

  @Get()
  @HttpCode(200)
  async findAll(
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityLogService.findAll({
      action,
      entity,
      userId,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('stats')
  @HttpCode(200)
  async getStats() {
    return this.activityLogService.getStats();
  }
}
