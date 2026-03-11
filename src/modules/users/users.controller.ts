import { Controller, Get, Param, UseGuards, Delete, HttpCode, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UpdateBiDto } from './dtos/update-bi.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  async updateMyProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateMyProfile(user.id, dto);
  }

  @Patch('me/bi')
  @UseGuards(JwtAuthGuard)
  async updateMyBi(
    @CurrentUser() user: { id: string },
    @Body() updateBiDto: UpdateBiDto,
  ) {
    return this.usersService.updateMyBi(user.id, updateBiDto.numeroBIAnterior);
  }
}
