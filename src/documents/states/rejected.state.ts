import { DocumentStatus } from '../../common/enums';
import { BaseDocumentState } from './base.state';
import { Document } from '../entities/document.entity';

export class RejectedState extends BaseDocumentState {
  override correctDocument(document: Document): DocumentStatus {
    document.status = DocumentStatus.IN_EDITION;
    return DocumentStatus.IN_EDITION;
  }

  override archive(document: Document): DocumentStatus {
    document.status = DocumentStatus.ARCHIVED;
    return DocumentStatus.ARCHIVED;
  }

  override isEditable(): boolean {
    return true;
  }
}
