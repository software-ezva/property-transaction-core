export class UserRoleNotAuthorizedToJoinTransactionException extends Error {
  constructor() {
    super('User role not authorized to join transaction.');
  }
}
