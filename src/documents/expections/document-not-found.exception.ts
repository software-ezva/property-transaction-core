export class DocumentNotFoundException extends Error {
  constructor(documentId: string, message?: string) {
    super(message || `Document with ID '${documentId}' not found.`);
  }
}
