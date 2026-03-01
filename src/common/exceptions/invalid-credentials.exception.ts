import { UnauthorizedException } from '@nestjs/common';

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      statusCode: 401,
      message: 'Email ou senha inválidos. Verifique suas credenciais.',
      error: 'UNAUTHORIZED',
    });
  }
}
