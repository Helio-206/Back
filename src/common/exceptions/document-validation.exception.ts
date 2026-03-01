import { BadRequestException } from '@nestjs/common';

export class DocumentValidationException extends BadRequestException {
  constructor(reason: string) {
    super({
      statusCode: 400,
      message: `Erro ao processar documento: ${reason}`,
      error: 'BAD_REQUEST',
    });
  }

  static fileTooLarge(maxSizeMB: number): DocumentValidationException {
    return new DocumentValidationException(
      `Arquivo muito grande. Máximo permitido: ${maxSizeMB}MB`
    );
  }

  static invalidMimeType(provided: string, allowed: string[]): DocumentValidationException {
    return new DocumentValidationException(
      `Tipo de arquivo não permitido: ${provided}. Tipos aceitos: ${allowed.join(', ')}`
    );
  }

  static duplicateDocument(type: string): DocumentValidationException {
    return new DocumentValidationException(
      `Documento do tipo "${type}" já foi enviado para este agendamento`
    );
  }

  static missingFileName(): DocumentValidationException {
    return new DocumentValidationException('Arquivo deve possuir nome válido');
  }
}
