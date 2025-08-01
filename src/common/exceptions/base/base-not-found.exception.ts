/**
 * Base exception for not found errors
 * Can be extended by specific modules for their own not found cases
 */
export abstract class BaseNotFoundException extends Error {
  constructor(resourceType: string, identifier: string) {
    super(`${resourceType} not found with identifier: ${identifier}`);
    this.name = 'BaseNotFoundException';
  }
}
