// src/documents/states/base-document-state.class.ts
import { DocumentState } from './document-state.interface';
import { DocumentStatus } from '../../common/enums';
import { Document } from '../entities/document.entity';
import { InvalidStatusTransitionException } from '../expections/invalid-status-transition.exception';

export abstract class BaseDocumentState implements DocumentState {
  checkForEdit(document: Document): DocumentStatus {
    throw new InvalidStatusTransitionException(
      document.status,
      DocumentStatus.IN_EDITION,
      'checkForEdit action is not allowed in the current document state.',
    );
  }

  readyForSigning(document: Document): DocumentStatus {
    throw new InvalidStatusTransitionException(
      document.status,
      DocumentStatus.AWAITING_SIGNATURES,
      'readyForSigning action is not allowed in the current document state.',
    );
  }

  correctDocument(document: Document): DocumentStatus {
    throw new InvalidStatusTransitionException(
      document.status,
      DocumentStatus.IN_EDITION,
      'correctDocument action is not allowed in the current document state.',
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sign(document: Document, _allSignaturesComplete: boolean): DocumentStatus {
    throw new InvalidStatusTransitionException(
      document.status,
      DocumentStatus.SIGNED,
      'sign action is not allowed in the current document state.',
    );
  }

  reject(document: Document): DocumentStatus {
    throw new InvalidStatusTransitionException(
      document.status,
      DocumentStatus.REJECTED,
      'reject action is not allowed in the current document state.',
    );
  }

  archive(document: Document): DocumentStatus {
    throw new InvalidStatusTransitionException(
      document.status,
      DocumentStatus.ARCHIVED,
      'archive action is not allowed in the current document state.',
    );
  }

  isEditable(): boolean {
    return false;
  }

  isSignable(): boolean {
    return false;
  }
}
