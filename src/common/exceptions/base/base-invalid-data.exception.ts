/**
 * Base exception for invalid data errors
 * Can be extended by specific modules for their own validation cases
 */
export abstract class BaseInvalidDataException extends Error {
  constructor(resourceType: string, message: string) {
    super(`Invalid ${resourceType} data: ${message}`);
    this.name = 'BaseInvalidDataException';
  }
}
