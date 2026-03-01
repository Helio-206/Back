import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Validates that a date is at least N days in the future
 * Useful for scheduling to prevent past dates and ensure minimum advance notice
 */
@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class FutureDateValidator implements ValidatorConstraintInterface {
  minDaysAhead: number = 1;

  validate(value: Date | string | undefined): boolean {
    if (!value) return false;

    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return false;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + this.minDaysAhead);
      tomorrow.setHours(0, 0, 0, 0);

      return date >= tomorrow;
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return `Data deve ser no mínimo ${this.minDaysAhead} dia(s) no futuro`;
  }
}

/**
 * Decorator to validate that a date is at least N days in the future
 * @example
 * @IsFutureDate({ minDaysAhead: 1 })
 * scheduledDate: Date;
 */
export function IsFutureDate(
  options?: { minDaysAhead?: number },
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return function (target: object, propertyName: string | symbol): void {
    const validator = new FutureDateValidator();
    if (options?.minDaysAhead) {
      validator.minDaysAhead = options.minDaysAhead;
    }

    registerDecorator({
      target: target.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [],
      validator,
    });
  };
}
