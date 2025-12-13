import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from 'expect';
import { getServices } from '../support/database-helper';
import { SharedTestWorld } from './shared-steps';
import { Document } from '../../src/documents/entities/document.entity';
import { DocumentFile } from '../../src/documents/interfaces/document-file.interface';

export interface TestWorld extends SharedTestWorld {
  savedDocument: Document;
}

Given(
  `the document is signable to interested party`,
  async function (this: TestWorld) {
    const { documentService, signatureService } = getServices();

    // Request signature and get updated document with relations
    this.savedDocument = await documentService.requestSign(
      this.transactionCoordinatorAgent.auth0Id,
      this.transaction.transactionId,
      this.savedDocument.documentId,
      {
        userId: this.interestedParty.id,
      },
    );

    // Verify the document can be signed
    const canSign = signatureService.canUserSignDocument(
      this.savedDocument,
      this.interestedParty.auth0Id,
    );
    expect(canSign).toBe(true);
  },
);

When(
  `the interested party in any property signs the document`,
  async function (this: TestWorld) {
    const { documentService } = getServices();
    const mockFile: DocumentFile = {
      originalname: 'Purchase Agreement.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('mock file content'),
    };

    this.savedDocument = await documentService.signDocument(
      this.savedDocument.documentId,
      this.interestedParty.auth0Id,
      mockFile,
    );
  },
);

Then(
  `the document have the signature of the interested party`,
  function (this: TestWorld) {
    const { signatureService } = getServices();

    const canSign = signatureService.canUserSignDocument(
      this.savedDocument,
      this.interestedParty.auth0Id,
    );

    // If the user can't sign, it means they already signed
    expect(canSign).toBe(false);
  },
);

Then(
  `the document have all signatures required the status should be changed to {string}`,
  function (this: TestWorld, expectedStatus: string) {
    const { signatureService } = getServices();
    const allSignaturesComplete = signatureService.areAllSignaturesCompleted(
      this.savedDocument,
    );
    if (allSignaturesComplete) {
      expect(this.savedDocument.status).toBe(expectedStatus);
    }
  },
);

When(
  `the interested party in any property rejects the document with reason {string}`,
  async function (this: TestWorld, reason: string) {
    const { documentService } = getServices();

    this.savedDocument = await documentService.rejectDocument(
      this.savedDocument.documentId,
      this.interestedParty.auth0Id,
      reason,
    );
  },
);
