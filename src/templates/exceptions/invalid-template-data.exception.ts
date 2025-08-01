export class InvalidTemplateDataException extends Error {
  constructor(message: string) {
    super(`Invalid template data: ${message}`);
    this.name = 'InvalidTemplateDataException';
  }
}
