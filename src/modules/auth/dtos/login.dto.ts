import { IsEmail, IsString, MinLength, IsNotEmpty, MaxLength } from 'class-validator';

/**
 * User login DTO with strict validation
 */
export class LoginDto {
  /**
   * User email address
   */
  @IsEmail({}, { message: 'Email deve ser válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  /**
   * User password
   */
  @IsString({ message: 'Senha deve ser texto' })
  @MinLength(8, { message: 'Senha deve ter mínimo 8 caracteres' })
  @MaxLength(50, { message: 'Senha deve ter máximo 50 caracteres' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password!: string;
}
