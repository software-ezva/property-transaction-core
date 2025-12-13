export class DuplicateTransactionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateTransactionException';
  }
}
