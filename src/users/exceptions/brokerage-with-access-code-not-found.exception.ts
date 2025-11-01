export class BrokerageWithAccessCodeNotFoundException extends Error {
  constructor(accessCode: string) {
    super(`Brokerage with access code "${accessCode}" not found`);
  }
}
