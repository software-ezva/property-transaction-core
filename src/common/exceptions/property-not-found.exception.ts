export class PropertyNotFoundException extends Error {
  constructor(propertyId: number) {
    super(`Property with ID ${propertyId} not found`);
    this.name = 'PropertyNotFoundException';
  }
}
