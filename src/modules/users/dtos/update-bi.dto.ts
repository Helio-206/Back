import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdateBiDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{9}[A-Z]{2}\d{3,4}$/, {
    message: 'BI inválido. Formato: 9 dígitos + 2 letras + 3-4 dígitos (ex: 007654844BO042)'
  })
  numeroBIAnterior!: string;
}
