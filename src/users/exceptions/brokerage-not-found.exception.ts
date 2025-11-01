export class BrokerageNotFoundException extends Error {
  constructor(brokerageId: string) {
    super(`Brokerage with ID ${brokerageId} not found`);
    this.name = 'BrokerageNotFoundException';
  }
}
