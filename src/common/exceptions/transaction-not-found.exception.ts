export class TransactionNotFoundException extends Error {
  constructor(transactionId: number) {
    super(`Transaction with ID ${transactionId} not found`);
    this.name = 'TransactionNotFoundException';
  }
}
