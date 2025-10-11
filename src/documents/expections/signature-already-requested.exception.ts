export class SignatureAlreadyRequestedException extends Error {
  constructor(userId: string, documentId: string) {
    super(
      `Signature already requested for user ${userId} on document ${documentId}. Cannot create duplicate signature requests.`,
    );
  }
}
