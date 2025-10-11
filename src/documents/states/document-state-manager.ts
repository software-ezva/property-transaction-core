// src/documents/status-manager.service.ts
import { Injectable } from '@nestjs/common';
import { DocumentStatus } from '../../common/enums';
import { DocumentState } from './document-state.interface';
import { PendingState } from './pending.state';
import { InEditionState } from './in-edition.state';
import { AwaitingSignaturesState } from './awaiting-signatures.state';
import { RejectedState } from './rejected.state';
import { SignedState } from './signed.state';
import { ArchivedState } from './archived.state';

@Injectable()
export class StatusManager {
  private readonly stateMap: Map<DocumentStatus, DocumentState>;

  constructor() {
    this.stateMap = new Map<DocumentStatus, DocumentState>();
    this.stateMap.set(DocumentStatus.PENDING, new PendingState());
    this.stateMap.set(DocumentStatus.IN_EDITION, new InEditionState());
    this.stateMap.set(
      DocumentStatus.AWAITING_SIGNATURES,
      new AwaitingSignaturesState(),
    );
    this.stateMap.set(DocumentStatus.REJECTED, new RejectedState());
    this.stateMap.set(DocumentStatus.SIGNED, new SignedState());
    this.stateMap.set(DocumentStatus.ARCHIVED, new ArchivedState());
  }

  getStateFor(status: DocumentStatus): DocumentState {
    const state = this.stateMap.get(status);
    if (!state) {
      throw new Error(`Estado desconocido: ${status}`);
    }
    return state;
  }
}
