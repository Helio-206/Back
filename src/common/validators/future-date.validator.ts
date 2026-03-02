import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (!value) {
      return false;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return false;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return date > now;
  }

  defaultMessage(): string {
    return 'Data deve ser no futuro';
  }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}
