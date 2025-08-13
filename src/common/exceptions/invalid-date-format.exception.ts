import { BaseInvalidDataException } from './base/base-invalid-data.exception';

/**
 * Exception thrown when a date format is invalid
 */
export class InvalidDateFormatException extends BaseInvalidDataException {
  constructor(fieldName: string, value: any) {
    super(
      'date',
      `Field '${fieldName}' has invalid date format. Expected format: YYYY-MM-DD. Received: ${value}`,
    );
    this.name = 'InvalidDateFormatException';
  }
}
