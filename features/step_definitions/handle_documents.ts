import { Given, Then, When } from '@cucumber/cucumber';
import { getRepositories, getServices } from '../support/database-helper';
import { faker } from '@faker-js/faker';
import { expect } from 'expect';
import { DocumentCategory } from '../../src/common/enums';
import { DocumentStatus } from '../../src/common/enums';
import { DocumentTemplate } from '../../src/documents/entities/document-template.entity';
import { Document } from '../../src/documents/entities/document.entity';
import { InvalidStatusTransitionException } from '../../src/documents/expections/invalid-status-transition.exception';
import { DocumentFile } from '../../src/documents/interfaces/document-file.interface';
import { SharedTestWorld } from './shared-steps';

export interface TestWorld extends SharedTestWorld {
  documentTemplate: DocumentTemplate;
  documentName: string;
  savedDocument: Document;
  lastError: InvalidStatusTransitionException | undefined;
}

Given(
  `a real estate agent named {string}`,
  async function (this: TestWorld, agentName: string) {
    const { userService, transactionCoordinatorAgentProfilesService } =
      getServices();
    // Create real estate agent
    this.agent = await userService.create(
      faker.string.uuid(),
      faker.internet.email(),
      agentName,
      agentName,
    );

    // Create real estate agent profile
    await transactionCoordinatorAgentProfilesService.assignTransactionCoordinatorAgentProfile(
      this.agent.auth0Id,
      {
        esign_name: agentName,
        esign_initials: agentName.charAt(0).toUpperCase(),
        phone_number:
          '+1555' + faker.string.numeric(3) + faker.string.numeric(4),
        license_number: faker.string.alphanumeric(10),
      },
    );
    expect(
      await userService.verifyUserIsRealEstateAgent(this.agent.auth0Id),
    ).toBe(true);
  },
);

Given(
  `a document template category {string} exists`,
  function (this: TestWorld, templateCategory: string) {
    const validCategoryKeys = Object.keys(DocumentCategory);
    expect(validCategoryKeys).toContain(templateCategory);
  },
);

When(
  `the real estate agent uploads a document template named {string} with path {string} to the category {string}`,
  async function (
    this: TestWorld,
    templateName: string,
    path: string,
    category: string,
  ) {
    const { documentTemplateService } = getServices();
    const categoryValue =
      DocumentCategory[category as keyof typeof DocumentCategory];

    this.documentTemplate =
      await documentTemplateService.uploadTemplateDocument(
        templateName,
        path,
        categoryValue,
      );
  },
);

Then(
  `the document template {string} should be saved in the category {string}`,
  function (this: TestWorld, templateName: string, category: string) {
    this.documentName = templateName;
    const categoryValue =
      DocumentCategory[category as keyof typeof DocumentCategory];
    expect(this.documentTemplate?.category).toBe(categoryValue);
  },
);

Given(
  `a document template with id {string} in category {string} exists`,
  async function (this: TestWorld, templateName: string, category: string) {
    const { documentTemplateService } = getServices();
    const categoryValue =
      DocumentCategory[category as keyof typeof DocumentCategory];
    this.documentTemplate =
      await documentTemplateService.uploadTemplateDocument(
        templateName,
        `templates/${faker.string.uuid()}_${templateName.replace(/\s+/g, '_')}.pdf`,
        categoryValue,
      );
  },
);

When(
  `the real estate agent adds the document from document templates to the transaction`,
  async function (this: TestWorld) {
    const { documentService } = getServices();
    const { transactionRepository } = getRepositories();
    this.savedDocument = await documentService.addDocumentToTransaction(
      this.agent.auth0Id,
      this.transaction.transactionId,
      this.documentTemplate.documentTemplateId,
    );

    const foundTransaction = await transactionRepository.findOne({
      where: { transactionId: this.transaction.transactionId },
      relations: ['documents'],
    });
    if (!foundTransaction) {
      throw new Error('Transaction not found');
    }
    this.transaction = foundTransaction;
  },
);

Then(
  `the document {string} should be duplicated in the transaction`,
  function (this: TestWorld, documentName: string) {
    const { documentService } = getServices();
    this.documentName = documentName;
    const isDuplicated = documentService.existsInTransaction(
      this.transaction,
      this.savedDocument,
    );
    expect(isDuplicated).toBe(true);
  },
);

Given(
  `the transaction has a document named {string} with status {string}`,
  async function (this: TestWorld, documentName: string, status: string) {
    const { documentTemplateService, documentService } = getServices();
    this.documentTemplate =
      await documentTemplateService.uploadTemplateDocument(
        documentName,
        `templates/${faker.string.uuid()}_${documentName.replace(/\s+/g, '_')}.pdf`,
        DocumentCategory.MISCELLANEOUS,
      );
    this.savedDocument = await documentService.addDocumentToTransaction(
      this.agent.auth0Id,
      this.transaction.transactionId,
      this.documentTemplate.documentTemplateId,
      status as DocumentStatus,
    );
    expect(this.savedDocument.status).toBe(status as DocumentStatus);
  },
);

When(
  `the real estate agent checks the document for editing`,
  async function (this: TestWorld) {
    const { documentService } = getServices();
    const { document } = await documentService.checkDocumentForEdit(
      this.agent.auth0Id,
      this.savedDocument.documentId,
      this.transaction.transactionId,
    );
    this.savedDocument = document;
  },
);

Then(
  `the document status should be changed to {string}`,
  function (this: TestWorld, newStatus: string) {
    expect(this.savedDocument.status).toBe(newStatus as DocumentStatus);
  },
);
Then(`the document should be editable`, function (this: TestWorld) {
  const { documentService } = getServices();
  const isEditable = documentService.isDocumentEditable(this.savedDocument);
  expect(isEditable).toBe(true);
});

// When the real estate agent edits the document and is ready for signing
When(
  `the real estate agent edits the document and is ready for signing`,
  async function (this: TestWorld) {
    const { documentService } = getServices();
    // Simular archivo para la edición
    const mockFile: DocumentFile = {
      originalname: 'Purchase Agreement.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('mock file content'),
    };

    const { document } = await documentService.edit(
      this.transaction.transactionId,
      this.savedDocument.documentId,
      this.agent.auth0Id,
      mockFile,
      true,
    );
    this.savedDocument = document;
  },
);

Then(
  `the status of the document should be changed to {string}`,
  function (this: TestWorld, newStatus: string) {
    expect(this.savedDocument.status).toBe(newStatus as DocumentStatus);
  },
);

Then(`the document should be signable`, function (this: TestWorld) {
  const { documentService } = getServices();
  const isSignable = documentService.isDocumentSignable(this.savedDocument);
  expect(isSignable).toBe(true);
});

When(
  `the real estate agent requests a sign for the document of party interested`,
  async function (this: TestWorld) {
    const { documentService } = getServices();
    this.savedDocument = await documentService.requestSign(
      this.agent.auth0Id,
      this.transaction.transactionId,
      this.savedDocument.documentId,
      {
        userId: this.interestedParty.id,
      },
    );
  },
);

Then(
  `the document could be signed by the interested party`,
  function (this: TestWorld) {
    const { signatureService } = getServices();

    // Use the document returned from requestSign (already has relations loaded)
    const canSign = signatureService.canUserSignDocument(
      this.savedDocument,
      this.interestedParty.auth0Id,
    );
    expect(canSign).toBe(true);
  },
);

When(
  `the real estate agent corrects the document after rejection`,
  async function (this: TestWorld) {
    const { documentService } = getServices();

    // First, correct the document status (from Rejected to In Edition)
    this.savedDocument = await documentService.correctDocument(
      this.agent.auth0Id,
      this.transaction.transactionId,
      this.savedDocument.documentId,
    );

    // Then edit the document with the new file
    const mockFile: DocumentFile = {
      originalname: 'Purchase Agreement.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('mock file content'),
    };

    const { document } = await documentService.edit(
      this.transaction.transactionId,
      this.savedDocument.documentId,
      this.agent.auth0Id,
      mockFile,
      false,
    );
    this.savedDocument = document;
  },
);
