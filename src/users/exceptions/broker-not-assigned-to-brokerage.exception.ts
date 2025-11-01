export class BrokerNotAssignedToBrokerageException extends Error {
  constructor(brokerId?: string) {
    super(
      brokerId
        ? `Broker with ID ${brokerId} is not currently assigned to any brokerage`
        : 'Broker is not currently assigned to any brokerage',
    );
    this.name = 'BrokerNotAssignedToBrokerageException';
  }
}
