export class UserIsNotTransactionCoordinatorAgentException extends Error {
  constructor() {
    super('User is not a transaction coordinator agent');
  }
}
