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
import { CentrosService } from './centros.service';
import { CreateCentroDto } from './dtos/create-centro.dto';
import { UpdateCentroDto } from './dtos/update-centro.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('centros')
export class CentrosController {
  constructor(private centrosService: CentrosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCentroDto: CreateCentroDto, @CurrentUser() user) {
    return this.centrosService.create(user.id, createCentroDto);
  }

  @Get()
  async findAll() {
    return this.centrosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.centrosService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCentroDto: UpdateCentroDto,
  ) {
    return this.centrosService.update(id, updateCentroDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deactivate(@Param('id') id: string) {
    return this.centrosService.deactivate(id);
  }
}
