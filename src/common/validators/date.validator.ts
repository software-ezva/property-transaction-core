import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFutureOrTodayDate', async: false })
export class IsFutureOrTodayDateConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any) {
    if (value === null || value === undefined) {
      return true; // Allow null/undefined values
    }

    if (typeof value !== 'string') {
      return false;
    }

    const inputDate = new Date(value);

    // Check if it's a valid date
    if (isNaN(inputDate.getTime())) {
      return false;
    }

    // Get today's date at midnight (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get input date at midnight for comparison
    const inputDateMidnight = new Date(inputDate);
    inputDateMidnight.setHours(0, 0, 0, 0);

    // Date must be today or in the future
    return inputDateMidnight >= today;
  }

  defaultMessage() {
    return "Expected closing date cannot be in the past. Please provide today's date or a future date.";
  }
}

export function IsFutureOrTodayDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureOrTodayDateConstraint,
    });
  };
}
