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
  Query,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createAgendamentoDto: CreateScheduleDto,
    @CurrentUser() user,
  ) {
    return this.schedulesService.create(user.id, createAgendamentoDto);
  }

  @Get()
  async findAll(@Query('centerId') centerId?: string) {
    if (centerId) {
      return this.schedulesService.findByCentro(centerId);
    }
    return this.schedulesService.findAll();
  }

  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  async findMySchedules(@CurrentUser() user) {
    return this.schedulesService.findByUser(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateAgendamentoDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, updateAgendamentoDto);
  }

  @Delete(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async cancel(@Param('id') id: string) {
    return this.schedulesService.cancel(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    return this.schedulesService.delete(id);
  }
}
