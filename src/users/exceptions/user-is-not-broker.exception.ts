export class UserIsNotBrokerException extends Error {
  constructor() {
    super('User is not a broker');
    this.name = 'UserIsNotBrokerException';
  }
}
