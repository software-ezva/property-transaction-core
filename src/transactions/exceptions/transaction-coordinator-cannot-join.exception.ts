export class TransactionCoordinatorCannotJoinException extends Error {
  constructor() {
    super('Transaction Coordinators cannot join transactions via access code.');
  }
}
