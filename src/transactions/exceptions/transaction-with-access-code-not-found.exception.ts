import { NotFoundException } from '@nestjs/common';

export class TransactionWithAccessCodeNotFoundException extends NotFoundException {
  constructor(accessCode: string) {
    super(`Transaction with access code ${accessCode} not found`);
  }
}
