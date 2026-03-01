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
import { CentersService } from './centers.service';
import { CreateCenterDto } from './dtos/create-center.dto';
import { UpdateCenterDto } from './dtos/update-center.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Provincia } from '@prisma/client';

@Controller('centers')
export class CentersController {
  constructor(private readonly centersService: CentersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCenterDto: CreateCenterDto, @CurrentUser() user: { id: string }) {
    return this.centersService.create(user.id, createCenterDto);
  }

  @Get()
  async findAll(
    @Query('provincia') provincia?: Provincia,
    @Query('type') type?: string,
    @Query('active') active?: string
  ) {
    const filters = {
      provincia,
      type,
      active: active === 'true' ? true : active === 'false' ? false : undefined,
    };
    return this.centersService.findAll(filters);
  }

  @Get('provincia/:provincia')
  async findByProvincia(@Param('provincia') provincia: Provincia) {
    return this.centersService.findByProvincia(provincia);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.centersService.findOne(id);
  }

  @Get(':id/statistics')
  async getStatistics(@Param('id') id: string) {
    return this.centersService.getStatistics(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateCenterDto: UpdateCenterDto) {
    return this.centersService.update(id, updateCenterDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(@Param('id') id: string) {
    return this.centersService.deactivate(id);
  }
}
