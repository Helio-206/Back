import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsIn,
  Matches,
} from 'class-validator';
import { IsBIFormat } from '@common/validators';
import { Provincia } from '@prisma/client';

/**
 * User registration DTO with validation for Angolan BI scheduling system
 */
export class RegisterDto {
  /**
   * User email - must be unique in system
   */
  @IsEmail({}, { message: 'Email deve ser válido' })
  email!: string;

  /**
   * Full name of user
   */
  @IsString({ message: 'Nome deve ser texto' })
  @MinLength(3, { message: 'Nome deve ter mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter máximo 100 caracteres' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name!: string;

  /**
   * User password - minimum 8 characters, must contain uppercase and number
   */
  @IsString({ message: 'Senha deve ser texto' })
  @MinLength(8, { message: 'Senha deve ter mínimo 8 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'Senha deve conter pelo menos 1 letra maiúscula e 1 número',
  })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password!: string;

  /**
   * Previous BI number (if exists) - Format: #########LA### (Angola format)
   */
  @IsOptional()
  @IsBIFormat()
  numeroBIAnterior?: string;

  /**
   * Date of birth
   */
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Data deve estar em formato ISO 8601 (YYYY-MM-DD)' })
  dataNascimento?: string;

  /**
   * Birth province
   */
  @IsOptional()
  @IsIn(Object.values(Provincia), {
    message: 'Província de nascimento inválida',
  })
  provinciaNascimento?: Provincia;

  /**
   * Residence province
   */
  @IsOptional()
  @IsIn(Object.values(Provincia), {
    message: 'Província de residência inválida',
  })
  provinciaResidencia?: Provincia;

  /**
   * Gender (M, F, or Outro)
   */
  @IsOptional()
  @IsIn(['M', 'F', 'Outro'], {
    message: 'Gênero deve ser M, F ou Outro',
  })
  genero?: string;

  /**
   * Parent or tutor names
   */
  @IsOptional()
  @IsString({ message: 'Filiação deve ser texto' })
  @MaxLength(255, { message: 'Filiação deve ter máximo 255 caracteres' })
  filiacao?: string;
}
