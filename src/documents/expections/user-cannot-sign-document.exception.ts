export class UserCannotSignDocumentException extends Error {
  constructor(userId: string, documentId: string) {
    super(`User ${userId} is not a required signer for document ${documentId}`);
    this.name = 'UserCannotSignDocumentException';
  }
}
