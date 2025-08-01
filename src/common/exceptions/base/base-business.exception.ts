/**
 * Base exception for business logic conflicts
 * Can be extended by specific modules for their own business rule violations
 */
export abstract class BaseBusinessException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BaseBusinessException';
  }
}
