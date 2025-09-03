import { getDataSource } from './hooks';
import { Transaction } from '../../src/transactions/entities/transaction.entity';
import { Property } from '../../src/properties/entities/property.entity';
import { User } from '../../src/users/entities/user.entity';
import { Profile } from '../../src/users/entities/profile.entity';
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
import { ProfilesService } from '../../src/users/services/profiles.service';
import { PropertiesService } from '../../src/properties/properties.service';
import { WorkflowAnalyticsService } from '../../src/transactions/workflow-analytics.service';
import { ChecklistTemplateService } from '../../src/templates/services/checklist-template.service';
import { ItemTemplateService } from '../../src/templates/services/item-template.service';
import { DocumentTemplate } from '../../src/documents/entities/document-template.entity';
import { Document } from '../../src/documents/entities/document.entity';
import { DocumentTemplatesService } from '../../src/documents/services/document-templates.service';
import { DocumentsService } from '../../src/documents/services/documents.service';

// Lazy initialization functions
export function getRepositories() {
  const dataSource = getDataSource();
  return {
    userRepository: dataSource.getRepository(User),
    propertyRepository: dataSource.getRepository(Property),
    profileRepository: dataSource.getRepository(Profile),
    realEstateAgentProfileRepository: dataSource.getRepository(
      RealEstateAgentProfile,
    ),
    clientProfileRepository: dataSource.getRepository(ClientProfile),
    brokerageRepository: dataSource.getRepository(Brokerage),
    transactionRepository: dataSource.getRepository(Transaction),
    workflowTemplateRepository: dataSource.getRepository(WorkflowTemplate),
    checklistTemplateRepository: dataSource.getRepository(ChecklistTemplate),
    itemTemplateRepository: dataSource.getRepository(ItemTemplate),
    workflowRepository: dataSource.getRepository(Workflow),
    checklistRepository: dataSource.getRepository(Checklist),
    itemRepository: dataSource.getRepository(Item),
    documentRepository: dataSource.getRepository(Document),
    documentTemplateRepository: dataSource.getRepository(DocumentTemplate),
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
  const profileService = new ProfilesService(
    repositories.userRepository,
    repositories.realEstateAgentProfileRepository,
    repositories.clientProfileRepository,
    repositories.brokerageRepository,
    userService,
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
    duplicateFile: async (originalFilePath: string) => {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const newPath = originalFilePath.replace(
        '/templates/',
        `/duplicates/${timestamp}_${randomId}_`,
      );
      return Promise.resolve(newPath);
    },
    uploadFile: async (file: { originalname: string }) => {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const sanitizedFilename = file.originalname.replace(
        /[^a-zA-Z0-9.-]/g,
        '_',
      );
      const filePath = `templates/${timestamp}_${randomId}_${sanitizedFilename}`;
      return Promise.resolve(filePath);
    },
    generateSecureUrl: (filePath: string, expirationHours = 1) => {
      const expiry = Date.now() + expirationHours * 60 * 60 * 1000;
      const mockSecureUrl = `https://firebasestorage.googleapis.com/v0/b/test-project.appspot.com/o/${encodeURIComponent(filePath)}?alt=media&token=test-token-${expiry}`;
      return mockSecureUrl;
    },
  };

  const documentService = new DocumentsService(
    repositories.documentRepository,
    transactionAuthorizationService,
    mockStorageService as any,
  );
  const documentTemplateService = new DocumentTemplatesService(
    repositories.documentTemplateRepository,
    userService,
    mockStorageService as any,
  );

  return {
    documentTemplateService,
    documentService,
    templatesService,
    transactionService,
    checklistService,
    itemService,
    userService,
    profileService,
    propertyService,
  };
}
