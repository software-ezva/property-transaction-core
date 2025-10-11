export class UserNotInTransactionException extends Error {
  constructor(userId: string, transactionId: string) {
    super(
      `User ${userId} is not a participant in transaction ${transactionId}. Only agents, clients, or supporting professionals can be assigned signature requests.`,
    );
  }
}
