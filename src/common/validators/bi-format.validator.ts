import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

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
