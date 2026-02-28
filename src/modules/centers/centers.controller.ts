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
} from '@nestjs/common';
import { CentersService } from './centers.service';
import { CreateCenterDto } from './dtos/create-center.dto';
import { UpdateCenterDto } from './dtos/update-center.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('centers')
export class CentersController {
  constructor(private centersService: CentersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createCenterDto: CreateCenterDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.centersService.create(user.id, createCenterDto);
  }

  @Get()
  async findAll() {
    return this.centersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.centersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCenterDto: UpdateCenterDto,
  ) {
    return this.centersService.update(id, updateCenterDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deactivate(@Param('id') id: string) {
    return this.centersService.deactivate(id);
  }
}
