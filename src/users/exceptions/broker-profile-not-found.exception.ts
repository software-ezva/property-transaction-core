export class BrokerProfileNotFoundException extends Error {
  constructor(identifier?: string) {
    super(
      identifier
        ? `User with ID ${identifier} does not have a broker profile assigned`
        : 'User does not have a broker profile assigned',
    );
    this.name = 'BrokerProfileNotFoundException';
  }
}
