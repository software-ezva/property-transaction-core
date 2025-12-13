export class UserIsNotClientException extends Error {
  constructor() {
    super('User is not a client');
  }
}
