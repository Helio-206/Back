import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateDocumentDto {
  @IsEnum(DocumentType, { message: 'Tipo de documento inválido' })
  @IsNotEmpty({ message: 'Tipo de documento é obrigatório' })
  documentType!: DocumentType;

  @IsString({ message: 'Caminho do arquivo deve ser texto' })
  @IsNotEmpty({ message: 'Caminho do arquivo é obrigatório' })
  filePath!: string;

  @IsString({ message: 'Nome do arquivo deve ser texto' })
  @IsNotEmpty({ message: 'Nome do arquivo é obrigatório' })
  fileName!: string;
}
