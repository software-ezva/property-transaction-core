import { Given, Then, When } from '@cucumber/cucumber';
import { User } from '../../src/users/entities/user.entity';
import { getRepositories, getServices } from '../support/database-helper';
import { faker } from '@faker-js/faker';
import { expect } from 'expect';
import { DocumentCategory } from '../../src/common/enums';
import { DocumentStatus } from '../../src/common/enums';
import { DocumentTemplate } from 'src/documents/entities/document-template.entity';
import { mapToTransactionType } from '../support/transaction-type-mapper';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Document } from '../../src/documents/entities/document.entity';
import { InvalidStatusTransitionException } from '../../src/documents/expections/invalid-status-transition.exception';
export interface TestWorld {
  user: User;
  documentTemplate: DocumentTemplate;
  transaction: Transaction;
  documentName: string;
  savedDocument: Document;
  lastError: InvalidStatusTransitionException | undefined;
}

Given(
  `a real estate agent named {string}`,
  async function (this: TestWorld, agentName: string) {
    const { userService, profileService } = getServices();
    // Create real estate agent
    this.user = await userService.create(
      faker.string.uuid(),
      faker.internet.email(),
      agentName,
      agentName,
    );

    // Create real estate agent profile
    await profileService.assignAgentProfile(this.user.auth0Id, {
      esign_name: agentName,
      esign_initials: agentName.charAt(0).toUpperCase(),
      phone_number: '+1555' + faker.string.numeric(3) + faker.string.numeric(4),
      license_number: faker.string.alphanumeric(10),
    });
    expect(
      await userService.verifyUserIsRealEstateAgent(this.user.auth0Id),
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
  `the real estate agent uploads a document template named {string} with url {string} to the category {string}`,
  async function (
    this: TestWorld,
    templateName: string,
    url: string,
    category: string,
  ) {
    const { documentTemplateService } = getServices();
    const categoryValue =
      DocumentCategory[category as keyof typeof DocumentCategory];

    this.documentTemplate =
      await documentTemplateService.uploadTemplateDocument(
        this.user.auth0Id,
        templateName,
        url,
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
  'a transaction of {string} created by the real estate agent {string} for the property {string}',
  async function (
    this: TestWorld,
    transactionType: string,
    agentName: string,
    propertyAddress: string,
  ) {
    const { transactionService } = getServices();
    await createTransactionForAgent.call(
      this,
      transactionType,
      agentName,
      propertyAddress,
    );

    // Verify transaction exists
    const hasTransaction = await transactionService.existsATransaction(
      this.transaction.property,
      this.user,
      null,
      this.transaction.transactionType,
    );
    expect(hasTransaction).toBe(true);
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
        this.user.auth0Id,
        templateName,
        faker.internet.url(),
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
      this.user,
      this.transaction,
      this.documentTemplate,
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
        this.user.auth0Id,
        documentName,
        faker.internet.url(),
        DocumentCategory.MISCELLANEOUS,
      );
    this.savedDocument = await documentService.addDocumentToTransaction(
      this.user,
      this.transaction,
      this.documentTemplate,
      status as DocumentStatus,
    );
    expect(this.savedDocument.status).toBe(status as DocumentStatus);
  },
);

When(
  `the real estate agent changes the status of the document {string} to {string}`,
  async function (this: TestWorld, documentName: string, status: string) {
    const { documentService } = getServices();
    try {
      this.savedDocument = await documentService.updateDocumentStatus(
        this.user.auth0Id,
        this.transaction.transactionId,
        this.savedDocument.documentId,
        status as DocumentStatus,
      );
      this.lastError = undefined;
    } catch (err) {
      // store error for the Then step to assert
      this.lastError = err as InvalidStatusTransitionException;
    }
  },
);

Then(
  `the document should have status {string}`,
  function (this: TestWorld, status: string) {
    const document = this.savedDocument;
    expect(document.status).toBe(status as DocumentStatus);
  },
);

Then(
  `an error should occur indicating that the status change is not allowed`,
  function (this: TestWorld) {
    const error = this.lastError;
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(InvalidStatusTransitionException);
  },
);

async function createTransactionForAgent(
  this: TestWorld,
  transactionType: string,
  agentName: string,
  propertyAddress: string,
) {
  const { userService, profileService, propertyService, transactionService } =
    getServices();

  // Create real estate agent
  this.user = await userService.create(
    faker.string.uuid(),
    faker.internet.email(),
    agentName,
    agentName,
  );

  // Create real estate agent profile
  await profileService.assignAgentProfile(this.user.auth0Id, {
    esign_name: agentName,
    esign_initials: agentName.charAt(0).toUpperCase(),
    phone_number: '+1555' + faker.string.numeric(3) + faker.string.numeric(4),
    license_number: faker.string.alphanumeric(10),
  });

  // Create property
  const property = await propertyService.create({
    address: propertyAddress,
    price: faker.number.int({ min: 100000, max: 1000000 }),
    size: faker.number.int({ min: 500, max: 5000 }),
    bedrooms: faker.number.int({ min: 1, max: 5 }),
    bathrooms: faker.number.int({ min: 1, max: 3 }),
  });

  // Create transaction with both agent and client
  this.transaction = await transactionService.createAndSaveTransaction(
    mapToTransactionType(transactionType),
    property,
    this.user,
    null,
    transactionType,
  );
}
