import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Validates Angolan BI (Bilhete de Identidade) format: #########LA###
 * Example: 123456789LA012
 */
@ValidatorConstraint({ name: 'isValidBIFormat', async: false })
export class BIFormatValidator implements ValidatorConstraintInterface {
  validate(value: string | undefined): boolean {
    if (!value) return true; // Optional field

    const biRegex = /^[0-9]{9}LA[0-9]{3}$/;
    return biRegex.test(value);
  }

  defaultMessage(): string {
    return 'Formato de BI inválido. Use: #########LA### (ex: 123456789LA012)';
  }
}

/**
 * Decorator to validate BI format in DTOs
 * @example
 * @IsBIFormat()
 * numeroBIAnterior?: string;
 */
export function IsBIFormat(validationOptions?: ValidationOptions): PropertyDecorator {
  return function (target: object, propertyName: string | symbol): void {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [],
      validator: BIFormatValidator,
    });
  };
}
