import {
  Controller,
  Get,
  Param,
  UseGuards,
  Delete,
  HttpCode,
  HttpStatus,
  Put,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.sub);
  }

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

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@CurrentUser() user: any, @Body() updateDto: any) {
    return this.usersService.updateProfile(user.sub, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }
}
