export class InvalidTransactionDataException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTransactionDataException';
  }
}
