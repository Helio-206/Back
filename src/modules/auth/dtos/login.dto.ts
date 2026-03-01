import { IsEmail, IsString, MinLength, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email deve ser válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  @IsString({ message: 'Senha deve ser texto' })
  @MinLength(8, { message: 'Senha deve ter mínimo 8 caracteres' })
  @MaxLength(50, { message: 'Senha deve ter máximo 50 caracteres' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password!: string;
}
