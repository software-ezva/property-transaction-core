import { DocumentStatus } from '../../common/enums';

export class DocumentNotReadyForSignaturesException extends Error {
  constructor(documentId: string, currentStatus: DocumentStatus) {
    super(
      `Document ${documentId} is not ready for signatures. Current status: ${currentStatus}. Document must be in AWAITING_SIGNATURES status to request signatures.`,
    );
  }
}
