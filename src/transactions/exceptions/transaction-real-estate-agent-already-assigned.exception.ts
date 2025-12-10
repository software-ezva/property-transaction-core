export class TransactionRealEstateAgentAlreadyAssignedException extends Error {
  constructor() {
    super('Transaction already has a real estate agent assigned.');
  }
}
