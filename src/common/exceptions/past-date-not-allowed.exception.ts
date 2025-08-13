import { BaseInvalidDataException } from './base/base-invalid-data.exception';

/**
 * Exception thrown when a date is in the past but should be today or future
 */
export class PastDateNotAllowedException extends BaseInvalidDataException {
  constructor(fieldName: string, providedDate: string) {
    super(
      'date',
      `Field '${fieldName}' cannot be in the past. Provided date: ${providedDate}. Please provide today's date or a future date.`,
    );
    this.name = 'PastDateNotAllowedException';
  }
}
