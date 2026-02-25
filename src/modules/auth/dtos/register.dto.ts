import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  nome: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  senha: string;
}
