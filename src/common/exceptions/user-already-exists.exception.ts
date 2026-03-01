import { ConflictException } from '@nestjs/common';

/**
 * Exception thrown when attempting to register a user with an email that already exists
 */
export class UserAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super({
      statusCode: 409,
      message: `Usuário com email ${email} já existe neste sistema`,
      error: 'CONFLICT',
    });
  }
}
