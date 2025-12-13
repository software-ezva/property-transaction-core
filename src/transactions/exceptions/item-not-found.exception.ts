import { NotFoundException } from '@nestjs/common';

export class ItemNotFoundException extends NotFoundException {
  constructor(itemId: string, transactionId?: string) {
    const message = transactionId
      ? `Item with ID ${itemId} not found in transaction ${transactionId}`
      : `Item with ID ${itemId} not found`;
    super(message);
  }
}
