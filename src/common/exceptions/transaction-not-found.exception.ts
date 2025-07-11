export class TransactionNotFoundException extends Error {
  constructor(transactionId: string) {
    super(`Transaction with ID ${transactionId} not found`);
    this.name = 'TransactionNotFoundException';
  }
}
