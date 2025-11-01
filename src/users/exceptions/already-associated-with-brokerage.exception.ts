export class AlreadyAssociatedWithBrokerageException extends Error {
  constructor(brokerageName: string) {
    super(`You are already associated with brokerage: ${brokerageName}`);
    this.name = 'AlreadyAssociatedWithBrokerageException';
  }
}
