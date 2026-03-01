import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@database/prisma.service';
import { Provincia } from '@prisma/client';

interface UpdateUserProfileDto {
  name?: string;
  dataNascimento?: string;
  provinciaNascimento?: Provincia;
  provinciaResidencia?: Provincia;
  genero?: string;
  filiacao?: string;
}

interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all users (admin only)
   * @returns Array of user profiles without passwords
   */
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get user by ID
   * @param id User ID
   * @returns User profile without password
   * @throws NotFoundException if user doesn't exist
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        dataNascimento: true,
        provinciaNascimento: true,
        provinciaResidencia: true,
        genero: true,
        filiacao: true,
        numeroBIAnterior: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }

  /**
   * Get user profile by email
   * @param email User email
   * @returns User profile if exists, null otherwise
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get user profile for logged-in user
   * @param userId User ID from JWT token
   * @returns Complete user profile
   * @throws NotFoundException if user doesn't exist
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        dataNascimento: true,
        provinciaNascimento: true,
        provinciaResidencia: true,
        genero: true,
        filiacao: true,
        numeroBIAnterior: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  /**
   * Update user profile information
   * @param userId User ID from JWT
   * @param updateDto Partial user profile data
   * @returns Updated user profile
   * @throws NotFoundException if user doesn't exist
   * @throws BadRequestException if invalid update
   */
  async updateProfile(userId: string, updateDto: UpdateUserProfileDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateDto.name && { name: updateDto.name }),
        ...(updateDto.dataNascimento && {
          dataNascimento: new Date(updateDto.dataNascimento),
        }),
        ...(updateDto.provinciaNascimento && {
          provinciaNascimento: updateDto.provinciaNascimento,
        }),
        ...(updateDto.provinciaResidencia && {
          provinciaResidencia: updateDto.provinciaResidencia,
        }),
        ...(updateDto.genero && { genero: updateDto.genero }),
        ...(updateDto.filiacao && { filiacao: updateDto.filiacao }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        dataNascimento: true,
        provinciaNascimento: true,
        provinciaResidencia: true,
        genero: true,
        filiacao: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Change user password
   * @param userId User ID from JWT
   * @param passwordChangeDto Current and new passwords
   * @throws NotFoundException if user doesn't exist
   * @throws BadRequestException if current password invalid
   */
  async changePassword(userId: string, passwordChangeDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      passwordChangeDto.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Senha atual inválida');
    }

    const hashedNewPassword = await bcrypt.hash(passwordChangeDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Senha alterada com sucesso' };
  }

  /**
   * Deactivate user account
   * @param userId User ID to deactivate
   * @returns Deactivation result
   * @throws NotFoundException if user doesn't exist
   */
  async deactivate(userId: string) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { active: false },
      select: {
        id: true,
        email: true,
        active: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Delete user account permanently (admin only)
   * Cascades delete to related records: schedules, documents, protocols
   * @param userId User ID to delete
   * @throws NotFoundException if user doesn't exist
   */
  async delete(userId: string) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.prisma.user.delete({
      where: { id: userId },
      select: { id: true, email: true },
    });
  }

  /**
   * Get users by role
   * @param role User role (ADMIN, CENTER, CITIZEN)
   * @returns Array of users with given role
   */
  async findByRole(role: Provincia | string) {
    return this.prisma.user.findMany({
      where: { role: role as any, active: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
