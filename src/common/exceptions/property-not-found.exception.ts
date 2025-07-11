export class PropertyNotFoundException extends Error {
  constructor(propertyId: string) {
    super(`Property with ID ${propertyId} not found`);
    this.name = 'PropertyNotFoundException';
  }
}
