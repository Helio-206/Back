import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  /**
   * Create new appointment
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createScheduleDto: CreateScheduleDto, @CurrentUser() user: { id: string }) {
    return this.schedulesService.create(user.id, createScheduleDto);
  }

  /**
   * Get all schedules or filter by center
   */
  @Get()
  async findAll(@Query('centerId') centerId?: string) {
    if (centerId) {
      return this.schedulesService.findByCenter(centerId);
    }
    return this.schedulesService.findAll();
  }

  /**
   * Get current user's schedules
   */
  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  async findMySchedules(@CurrentUser() user: { id: string }) {
    return this.schedulesService.findByUser(user.id);
  }

  /**
   * Get schedules by status
   */
  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    return this.schedulesService.findByStatus(status as any);
  }

  /**
   * Get schedule by protocol number
   */
  @Get('protocol/:numeroProtocolo')
  async findByProtocol(@Param('numeroProtocolo') numeroProtocolo: string) {
    return this.schedulesService.findByProtocolNumber(numeroProtocolo);
  }

  /**
   * Get schedule by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  /**
   * Update schedule details (description, notes, status)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  /**
   * Cancel schedule (soft delete)
   */
  @Delete(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string) {
    return this.schedulesService.cancel(id);
  }

  /**
   * Permanently delete schedule (admin only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.schedulesService.delete(id);
  }
}
