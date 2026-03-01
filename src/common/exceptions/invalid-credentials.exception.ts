import { UnauthorizedException } from '@nestjs/common';

/**
 * Exception thrown when login credentials are invalid (email not found or password mismatch)
 */
export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      statusCode: 401,
      message: 'Email ou senha inválidos. Verifique suas credenciais.',
      error: 'UNAUTHORIZED',
    });
  }
}
