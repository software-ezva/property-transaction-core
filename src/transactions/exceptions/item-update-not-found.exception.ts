export class ItemUpdateNotFoundException extends Error {
  constructor(updateId: string) {
    super(`Item update with ID ${updateId} not found`);
  }
}
