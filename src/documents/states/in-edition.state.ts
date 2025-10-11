import { DocumentStatus } from '../../common/enums';
import { BaseDocumentState } from './base.state';
import { Document } from '../entities/document.entity';

export class InEditionState extends BaseDocumentState {
  override readyForSigning(document: Document): DocumentStatus {
    document.status = DocumentStatus.AWAITING_SIGNATURES;
    return DocumentStatus.AWAITING_SIGNATURES;
  }

  override archive(document: Document): DocumentStatus {
    document.status = DocumentStatus.ARCHIVED;
    return DocumentStatus.ARCHIVED;
  }

  override isEditable(): boolean {
    return true;
  }
}
