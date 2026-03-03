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
} from '@nestjs/common';
import { CentersService } from './centers.service';
import { CreateCenterDto } from './dtos/create-center.dto';
import { UpdateCenterDto } from './dtos/update-center.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Provincia } from '@prisma/client';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Centers Controller - Manages all center-related endpoints
 * Base path: /centers
 */
@Controller('centers')
export class CentersController {
  constructor(private centersService: CentersService) {}

  /**
   * POST /centers - Create a new center
   * Required role: CENTER or ADMIN
   * Required authentication: Yes
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async create(@Body() createCenterDto: CreateCenterDto, @CurrentUser() user: AuthenticatedUser) {
    // Validate user role
    if (!['CENTER', 'ADMIN'].includes(user.role)) {
      throw new BadRequestException('Only users with CENTER or ADMIN role can create centers');
    }

    return this.centersService.create(user.id, createCenterDto);
  }

  /**
   * GET /centers - Get all centers with optional filters
   * Query parameters:
   *   - provincia: Filter by province (optional)
   *   - active: Filter by active status (optional, true/false)
   * Public endpoint (no auth required)
   */
  @Get()
  @HttpCode(200)
  async findAll(@Query('provincia') provincia?: Provincia, @Query('active') active?: string) {
    const filters: { provincia?: Provincia; active?: boolean } = {};

    if (provincia) {
      // Validate provincia enum
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

  /**
   * GET /centers/province/:provincia - Get all centers in a specific province
   * Convenient endpoint for filtering by province
   */
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

  /**
   * GET /centers/:id - Get a single center by ID
   * Includes last 10 schedules for the center
   * Public endpoint (no auth required)
   */
  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id') id: string) {
    return this.centersService.findOne(id);
  }

  /**
   * PUT /centers/:id - Update a center
   * Required role: CENTER (only own center) or ADMIN
   * Required authentication: Yes
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @Body() updateCenterDto: UpdateCenterDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    // Authorization check: only CENTER (own) or ADMIN can update
    if (!['CENTER', 'ADMIN'].includes(user.role)) {
      throw new BadRequestException('Only users with CENTER or ADMIN role can update centers');
    }

    // If CENTER role, verify it's their own center
    if (user.role === 'CENTER') {
      const center = await this.centersService.findOne(id);

      if (center.userId !== user.id) {
        throw new BadRequestException('You can only update your own center');
      }
    }

    return this.centersService.update(id, updateCenterDto);
  }

  /**
   * DELETE /centers/:id - Deactivate a center (soft delete)
   * Required role: CENTER (only own center) or ADMIN
   * Required authentication: Yes
   * Returns 204 No Content
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deactivate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    // Authorization check
    if (!['CENTER', 'ADMIN'].includes(user.role)) {
      throw new BadRequestException('Only users with CENTER or ADMIN role can deactivate centers');
    }

    // If CENTER role, verify it's their own center
    if (user.role === 'CENTER') {
      const center = await this.centersService.findOne(id);

      if (center.userId !== user.id) {
        throw new BadRequestException('You can only deactivate your own center');
      }
    }

    await this.centersService.deactivate(id);
  }

  /**
   * POST /centers/:id/reactivate - Reactivate a deactivated center
   * Required role: CENTER (only own center) or ADMIN
   * Required authentication: Yes
   */
  @Post(':id/reactivate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async reactivate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    // Authorization check
    if (!['CENTER', 'ADMIN'].includes(user.role)) {
      throw new BadRequestException('Only users with CENTER or ADMIN role can reactivate centers');
    }

    // If CENTER role, verify it's their own center
    if (user.role === 'CENTER') {
      const center = await this.centersService.findOne(id);

      if (center.userId !== user.id) {
        throw new BadRequestException('You can only reactivate your own center');
      }
    }

    return this.centersService.reactivate(id);
  }

  /**
   * GET /centers/statistics - Get center statistics (admin only)
   * Required role: ADMIN
   * Required authentication: Yes
   */
  @Get('admin/statistics')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async getStatistics(@CurrentUser() user: AuthenticatedUser) {
    if (user.role !== 'ADMIN') {
      throw new BadRequestException('Only ADMIN users can access statistics');
    }

    return this.centersService.getStatistics();
  }
}
