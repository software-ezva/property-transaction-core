export class DocumentTemplateNotFoundException extends Error {
  constructor(documentId: string, message?: string) {
    super(message || `Document with ID '${documentId}' not found.`);
  }
}
