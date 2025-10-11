import { DocumentStatus } from '../../common/enums';
import { BaseDocumentState } from './base.state';
import { Document } from '../entities/document.entity';

export class AwaitingSignaturesState extends BaseDocumentState {
  override sign(
    document: Document,
    allSignaturesComplete: boolean,
  ): DocumentStatus {
    const newStatus = allSignaturesComplete
      ? DocumentStatus.SIGNED
      : DocumentStatus.AWAITING_SIGNATURES;

    document.status = newStatus;
    return newStatus;
  }

  override reject(document: Document): DocumentStatus {
    document.status = DocumentStatus.REJECTED;
    return DocumentStatus.REJECTED;
  }

  override archive(document: Document): DocumentStatus {
    document.status = DocumentStatus.ARCHIVED;
    return DocumentStatus.ARCHIVED;
  }

  override isSignable(): boolean {
    return true;
  }
}
