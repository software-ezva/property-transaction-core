import { getDataSource } from './hooks';
import { Transaction } from '../../src/transactions/entities/transaction.entity';
import { Property } from '../../src/properties/entities/property.entity';
import { User } from '../../src/users/entities/user.entity';
import { Profile } from '../../src/users/entities/profile.entity';
import { TransactionCoordinatorAgentProfile } from '../../src/users/entities/transaction-coordinator-agent-profile.entity';
import { RealEstateAgentProfile } from '../../src/users/entities/real-estate-agent-profile.entity';
import { Brokerage } from '../../src/users/entities/brokerage.entity';
import { TransactionsService } from '../../src/transactions/services/transactions.service';
import { ChecklistService } from '../../src/transactions/services/checklist.service';
import { TemplatesService } from '../../src/templates/services/templates.service';
import { WorkflowTemplate } from '../../src/templates/entities/workflow-template.entity';
import { ChecklistTemplate } from '../../src/templates/entities/checklist-template.entity';
import { ItemTemplate } from '../../src/templates/entities/item-template.entity';
import { Workflow } from '../../src/transactions/entities/workflow.entity';
import { Checklist } from '../../src/transactions/entities/checklist.entity';
import { Item } from '../../src/transactions/entities/item.entity';
import { ItemService } from '../../src/transactions/services/item.service';
import { TransactionAuthorizationService } from '../../src/transactions/services/transaction-authorization.service';
import { UsersService } from '../../src/users/services/users.service';
import { ClientProfile } from '../../src/users/entities/client-profile.entity';
import { ClientProfilesService } from '../../src/users/services/client-profiles.service';
import { TransactionCoordinatorAgentProfilesService } from '../../src/users/services/transaction-coordinator-agent-profiles.service';
import { RealEstateAgentProfilesService } from '../../src/users/services/real-estate-agent-profiles.service';
import { SupportingProfessionalsService } from '../../src/users/services/supporting-professionals.service';
import { PropertiesService } from '../../src/properties/properties.service';
import { WorkflowAnalyticsService } from '../../src/transactions/workflow-analytics.service';
import { ChecklistTemplateService } from '../../src/templates/services/checklist-template.service';
import { ItemTemplateService } from '../../src/templates/services/item-template.service';
import { DocumentTemplate } from '../../src/documents/entities/document-template.entity';
import { Document } from '../../src/documents/entities/document.entity';
import { DocumentTemplatesService } from '../../src/documents/services/document-templates.service';
import { DocumentsService } from '../../src/documents/services/documents.service';
import { StatusManager } from '../../src/documents/states/document-state-manager';
import { Signature } from '../../src/documents/entities/signatures.entity';
import { SupportingProfessionalProfile } from '../../src/users/entities/supporting-professional-profile.entity';
import { SignatureService } from '../../src/documents/services/signature.service';
import { BrokerageService } from '../../src/users/services/brokerage.service';
import { BrokerProfilesService } from '../../src/users/services/broker-profiles.service';
import { BrokerProfile } from '../../src/users/entities/broker-profile.entity';

// Lazy initialization functions
export function getRepositories() {
  const dataSource = getDataSource();
  return {
    userRepository: dataSource.getRepository(User),
    propertyRepository: dataSource.getRepository(Property),
    profileRepository: dataSource.getRepository(Profile),
    transactionCoordinatorAgentProfileRepository: dataSource.getRepository(
      TransactionCoordinatorAgentProfile,
    ),
    realEstateAgentProfileRepository: dataSource.getRepository(
      RealEstateAgentProfile,
    ),
    clientProfileRepository: dataSource.getRepository(ClientProfile),
    brokerProfileRepository: dataSource.getRepository(BrokerProfile),
    brokerageRepository: dataSource.getRepository(Brokerage),
    supportingProfessionalRepository: dataSource.getRepository(
      SupportingProfessionalProfile,
    ),
    transactionRepository: dataSource.getRepository(Transaction),
    workflowTemplateRepository: dataSource.getRepository(WorkflowTemplate),
    checklistTemplateRepository: dataSource.getRepository(ChecklistTemplate),
    itemTemplateRepository: dataSource.getRepository(ItemTemplate),
    workflowRepository: dataSource.getRepository(Workflow),
    checklistRepository: dataSource.getRepository(Checklist),
    itemRepository: dataSource.getRepository(Item),
    documentRepository: dataSource.getRepository(Document),
    documentTemplateRepository: dataSource.getRepository(DocumentTemplate),
    signatureRepository: dataSource.getRepository(Signature),
  };
}

export function getServices() {
  const dataSource = getDataSource();
  const repositories = getRepositories();
  const userService = new UsersService(repositories.userRepository);
  const transactionAuthorizationService = new TransactionAuthorizationService(
    repositories.transactionRepository,
    userService,
  );

  const brokerageService = new BrokerageService(
    repositories.brokerageRepository,
    repositories.brokerProfileRepository,
    userService,
  );

  const brokerProfilesService = new BrokerProfilesService(
    repositories.userRepository,
    repositories.brokerProfileRepository,
    userService,
    brokerageService,
  );

  const clientProfilesService = new ClientProfilesService(
    repositories.userRepository,
    repositories.clientProfileRepository,
    userService,
  );
  const transactionCoordinatorAgentProfilesService =
    new TransactionCoordinatorAgentProfilesService(
      repositories.userRepository,
      repositories.transactionCoordinatorAgentProfileRepository,
      userService,
    );
  const realEstateAgentProfilesService = new RealEstateAgentProfilesService(
    repositories.userRepository,
    repositories.realEstateAgentProfileRepository,
    userService,
    brokerageService,
  );
  const supportingProfessionalProfilesService =
    new SupportingProfessionalsService(
      repositories.userRepository,
      repositories.supportingProfessionalRepository,
      userService,
      brokerageService,
    );

  const propertyService = new PropertiesService(
    repositories.propertyRepository,
  );
  const checklistTemplateService = new ChecklistTemplateService(
    new ItemTemplateService(),
  );
  const workflowAnalyticsService = new WorkflowAnalyticsService();
  const templatesService = new TemplatesService(
    repositories.workflowTemplateRepository,
    checklistTemplateService,
    dataSource,
  );

  const transactionService = new TransactionsService(
    repositories.transactionRepository,
    templatesService,
    userService,
    propertyService,
    workflowAnalyticsService,
    transactionAuthorizationService,
    dataSource,
  );

  const checklistService = new ChecklistService(
    repositories.checklistRepository,
  );

  const itemService = new ItemService(
    repositories.itemRepository,
    transactionAuthorizationService,
  );

  // Create a complete mock StorageService that implements all methods
  const mockStorageService = {
    logger: {
      log: (message: string) => console.log(`[MockStorageService] ${message}`),
      error: (message: string, stack?: string) =>
        console.error(`[MockStorageService] ${message}`, stack),
      warn: (message: string) =>
        console.warn(`[MockStorageService] ${message}`),
      debug: (message: string) =>
        console.debug(`[MockStorageService] ${message}`),
      verbose: (message: string) =>
        console.log(`[MockStorageService] ${message}`),
    },
    // Method missing: storageTemplateDocument
    storageTemplateDocument: async (
      file: { originalname: string },
      category: string,
      title: string,
    ) => {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const sanitizedFilename = file.originalname.replace(
        /[^a-zA-Z0-9.-]/g,
        '_',
      );
      const filePath = `templates/${category}/${title}_${timestamp}_${randomId}_${sanitizedFilename}`;
      console.log(
        `[MockStorageService] Template document uploaded: ${filePath}`,
      );
      return Promise.resolve(filePath);
    },
    // Method missing: storageTransactionDocument
    storageTransactionDocument: async (
      templatePath: string,
      title: string,
      transactionId: string,
    ) => {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const filePath = `transactions/${transactionId}/${timestamp}_${randomId}_${title}`;
      console.log(
        `[MockStorageService] Transaction document created: ${filePath} from template: ${templatePath}`,
      );
      return Promise.resolve(filePath);
    },
    duplicateFile: async (originalFilePath: string, newPath?: string) => {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const finalPath =
        newPath ||
        originalFilePath.replace(
          '/templates/',
          `/duplicates/${timestamp}_${randomId}_`,
        );
      console.log(
        `[MockStorageService] File duplicated: ${originalFilePath} -> ${finalPath}`,
      );
      return Promise.resolve(finalPath);
    },
    uploadFile: async (file: { originalname: string }, customPath?: string) => {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const sanitizedFilename = file.originalname.replace(
        /[^a-zA-Z0-9.-]/g,
        '_',
      );
      const filePath =
        customPath || `files/${timestamp}_${randomId}_${sanitizedFilename}`;
      console.log(`[MockStorageService] File uploaded: ${filePath}`);
      return Promise.resolve(filePath);
    },
    generateSecureUrl: (filePath: string, expirationHours = 1) => {
      const expiry = Date.now() + expirationHours * 60 * 60 * 1000;
      const mockSecureUrl = `https://firebasestorage.googleapis.com/v0/b/test-project.appspot.com/o/${encodeURIComponent(filePath)}?alt=media&token=test-token-${expiry}`;
      return mockSecureUrl;
    },
    replaceDocument: async (
      file: { originalname: string },
      oldFilePath: string,
    ) => {
      console.log(
        `[MockStorageService] Replacing document: ${oldFilePath} with new file: ${file.originalname}`,
      );
      return Promise.resolve();
    },
    // Method missing: deleteFile
    deleteFile: async (filePath: string) => {
      console.log(`[MockStorageService] File deleted: ${filePath}`);
      return Promise.resolve();
    },
  };

  const documentTemplateService = new DocumentTemplatesService(
    repositories.documentTemplateRepository,
    userService,
    mockStorageService as any,
  );

  const statusManager = new StatusManager();

  const signatureService = new SignatureService(
    repositories.signatureRepository,
  );

  const documentService = new DocumentsService(
    repositories.documentRepository,
    documentTemplateService,
    transactionAuthorizationService,
    mockStorageService as any,
    signatureService,
    statusManager,
    userService,
  );

  return {
    documentTemplateService,
    documentService,
    templatesService,
    transactionService,
    checklistService,
    itemService,
    userService,
    clientProfilesService,
    brokerProfilesService,
    transactionCoordinatorAgentProfilesService,
    realEstateAgentProfilesService,
    supportingProfessionalProfilesService,
    propertyService,
    signatureService,
  };
}
