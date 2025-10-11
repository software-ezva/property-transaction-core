import { DocumentStatus } from '../../common/enums';
import { Document } from '../entities/document.entity';

export interface DocumentState {
  checkForEdit(document: Document): DocumentStatus;
  readyForSigning(document: Document): DocumentStatus;
  correctDocument(document: Document): DocumentStatus;
  sign(document: Document, allSignaturesComplete: boolean): DocumentStatus;
  reject(document: Document): DocumentStatus;
  archive(document: Document): DocumentStatus;
  isEditable(): boolean;
  isSignable(): boolean;
}
