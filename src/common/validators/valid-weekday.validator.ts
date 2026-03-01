import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Validates that a date falls on valid weekdays (Monday-Friday by default)
 * Useful for business hours scheduling
 */
@ValidatorConstraint({ name: 'isValidWeekday', async: false })
export class ValidWeekdayValidator implements ValidatorConstraintInterface {
  allowedDays: number[] = [1, 2, 3, 4, 5]; // Monday to Friday (0=Sunday, 6=Saturday)

  validate(value: Date | string | undefined): boolean {
    if (!value) return false;

    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return false;

      const dayOfWeek = date.getDay();
      return this.allowedDays.includes(dayOfWeek);
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return 'Agendamentos são permitidos apenas de segunda a sexta';
  }
}

/**
 * Decorator to validate that a date falls on allowed weekdays
 * @example
 * @IsValidWeekday()
 * scheduledDate: Date;
 */
export function IsValidWeekday(validationOptions?: ValidationOptions): PropertyDecorator {
  return function (target: object, propertyName: string | symbol): void {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [],
      validator: ValidWeekdayValidator,
    });
  };
}
