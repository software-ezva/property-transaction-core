import { ForbiddenException } from '@nestjs/common';

export class UnauthorizedTransactionAccessException extends ForbiddenException {
  constructor(userAuth0Id: string, transactionId: string) {
    super(
      `User ${userAuth0Id} is not authorized to access transaction ${transactionId}`,
    );
  }
}
