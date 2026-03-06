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
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CentersService } from './centers.service';
import { CreateCenterDto } from './dtos/create-center.dto';
import { UpdateCenterDto } from './dtos/update-center.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Provincia, Role } from '@prisma/client';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

@Controller('centers')
export class CentersController {
  constructor(private centersService: CentersService) {}

  private async ensureCenterOwnership(id: string, user: AuthenticatedUser) {
    if (user.role !== Role.CENTER) {
      return;
    }

    const center = await this.centersService.findOne(id);
    if (center.userId !== user.id) {
      throw new ForbiddenException('You can only manage your own center');
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CENTER, Role.ADMIN)
  @HttpCode(201)
  async create(@Body() createCenterDto: CreateCenterDto, @CurrentUser() user: AuthenticatedUser) {
    return this.centersService.create(user.id, createCenterDto);
  }

  @Get()
  @HttpCode(200)
  async findAll(@Query('provincia') provincia?: Provincia, @Query('active') active?: string) {
    const filters: { provincia?: Provincia; active?: boolean } = {};

    if (provincia) {
      if (!Object.values(Provincia).includes(provincia)) {
        throw new BadRequestException(
          `Invalid province. Must be one of: ${Object.values(Provincia).join(', ')}`
        );
      }
      filters.provincia = provincia;
    }

    if (active !== undefined) {
      filters.active = active === 'true';
    }

    return this.centersService.findAll(filters);
  }

  @Get('province/:provincia')
  @HttpCode(200)
  async findByProvince(@Param('provincia') provincia: Provincia) {
    if (!Object.values(Provincia).includes(provincia)) {
      throw new NotFoundException(
        `Invalid province. Must be one of: ${Object.values(Provincia).join(', ')}`
      );
    }

    const centers = await this.centersService.findByProvince(provincia);

    if (centers.length === 0) {
      throw new NotFoundException(`No centers found in province: ${provincia}`);
    }

    return centers;
  }

  @Get('admin/statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  async getStatistics() {
    return this.centersService.getStatistics();
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id') id: string) {
    return this.centersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CENTER, Role.ADMIN)
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @Body() updateCenterDto: UpdateCenterDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    await this.ensureCenterOwnership(id, user);
    return this.centersService.update(id, updateCenterDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CENTER, Role.ADMIN)
  @HttpCode(204)
  async deactivate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.ensureCenterOwnership(id, user);
    await this.centersService.deactivate(id);
  }

  @Post(':id/reactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CENTER, Role.ADMIN)
  @HttpCode(200)
  async reactivate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.ensureCenterOwnership(id, user);
    return this.centersService.reactivate(id);
  }
}
