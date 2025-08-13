import { BaseInvalidDataException } from './base/base-invalid-data.exception';

/**
 * Exception thrown when an invalid date value is provided (not null, not string, or unparseable)
 */
export class InvalidDateValueException extends BaseInvalidDataException {
  constructor(
    fieldName: string,
    value: any,
    expectedType: string = 'string (YYYY-MM-DD) or null',
  ) {
    const valueType = value === null ? 'null' : typeof value;
    const valueDisplay = value === null ? 'null' : JSON.stringify(value);

    super(
      'date',
      `Field '${fieldName}' has invalid value. Expected: ${expectedType}. Received: ${valueDisplay} (type: ${valueType})`,
    );
    this.name = 'InvalidDateValueException';
  }
}
