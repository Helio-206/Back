import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateDocumentDto } from './dtos/create-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, scheduleId: string, createDocumentDto: CreateDocumentDto) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    if (schedule.userId !== userId) {
      throw new NotFoundException('Acesso negado');
    }

    return this.prisma.document.create({
      data: {
        ...createDocumentDto,
        userId,
        scheduleId,
        fileUrl: createDocumentDto.filePath,
        fileSize: 0,
        mimeType: 'application/pdf',
      },
    });
  }

  async findBySchedule(scheduleId: string) {
    return this.prisma.document.findMany({
      where: { scheduleId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async delete(documentId: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    if (document.userId !== userId) {
      throw new NotFoundException('Acesso negado');
    }

    return this.prisma.document.delete({
      where: { id: documentId },
    });
  }
}
