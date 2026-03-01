import { ConflictException } from '@nestjs/common';

export class UserAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super({
      statusCode: 409,
      message: `Usuário com email ${email} já existe neste sistema`,
      error: 'CONFLICT',
    });
  }
}
