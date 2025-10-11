export class DocumentAlreadySignedException extends Error {
  constructor(userId: string, documentId: string) {
    super(`Document ${documentId} has already been signed by user ${userId}`);
    this.name = 'DocumentAlreadySignedException';
  }
}
