export class TransactionClientAlreadyAssignedException extends Error {
  constructor() {
    super('Transaction already has a client assigned.');
  }
}
