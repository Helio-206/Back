import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isNotFutureDate', async: false })
export class IsNotFutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (!value) {
      return false;
    }

    const inputDate = new Date(value as string | number);
    if (Number.isNaN(inputDate.getTime())) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate <= today;
  }

  defaultMessage(): string {
    return 'Data de nascimento não pode ser superior à data corrente';
  }
}

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotFutureDateConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'hasMinimumAge', async: false })
export class HasMinimumAgeConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args?: ValidationArguments): boolean {
    if (!value) {
      return false;
    }

    const birthDate = new Date(value as string | number);
    if (Number.isNaN(birthDate.getTime())) {
      return false;
    }

    const [minimumAge] = (args?.constraints ?? [1]) as [number];
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }

    return age >= minimumAge;
  }

  defaultMessage(args?: ValidationArguments): string {
    const [minimumAge] = (args?.constraints ?? [1]) as [number];
    return `Apenas pessoas com ${minimumAge} ano${minimumAge > 1 ? 's' : ''} ou mais podem se registrar`;
  }
}

export function HasMinimumAge(minimumAge: number, validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName,
      options: validationOptions,
      constraints: [minimumAge],
      validator: HasMinimumAgeConstraint,
    });
  };
}
