import { DocumentStatus } from '../../common/enums';
import { BaseDocumentState } from './base.state';
import { Document } from '../entities/document.entity';

export class PendingState extends BaseDocumentState {
  override checkForEdit(document: Document): DocumentStatus {
    document.status = DocumentStatus.IN_EDITION;
    return DocumentStatus.IN_EDITION;
  }

  override archive(document: Document): DocumentStatus {
    document.status = DocumentStatus.ARCHIVED;
    return DocumentStatus.ARCHIVED;
  }
}
