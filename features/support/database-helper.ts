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
import { DocumentTemplateService } from '../../src/documents/services/document-templates.service';
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
  const mockStorageService = {
    duplicateFile: async (originalUrl: string) =>
      Promise.resolve(`${originalUrl}-${Date.now()}.pdf`),
  };
  const documentService = new DocumentsService(
    repositories.documentRepository,
    transactionAuthorizationService,
    mockStorageService,
  );
  const documentTemplateService = new DocumentTemplateService(
    repositories.documentTemplateRepository,
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
    profileService,
    propertyService,
  };
}
