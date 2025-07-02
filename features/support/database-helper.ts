import { getDataSource } from './hooks';
import { Transaction } from '../../src/transactions/entities/transaction.entity';
import { Property } from '../../src/properties/entities/property.entity';
import { User } from '../../src/users/entities/user.entity';
import { Profile } from '../../src/users/entities/profile.entity';
import { RealEstateAgentProfile } from '../../src/users/entities/real-estate-agent-profile.entity';
import { TransactionsService } from '../../src/transactions/transactions.service';
import { ChecklistService } from '../../src/transactions/checklist.service';
import { TemplatesService } from '../../src/templates/templates.service';
import { WorkflowTemplate } from '../../src/templates/entities/workflow-template.entity';
import { ChecklistTemplate } from '../../src/templates/entities/checklist-template.entity';
import { ItemTemplate } from '../../src/templates/entities/item-template.entity';
import { Workflow } from '../../src/transactions/entities/workflow.entity';
import { Checklist } from '../../src/transactions/entities/checklist.entity';
import { Item } from '../../src/transactions/entities/item.entity';
import { ItemService } from '../../src/transactions/item.service';

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
    transactionRepository: dataSource.getRepository(Transaction),
    workflowTemplateRepository: dataSource.getRepository(WorkflowTemplate),
    checklistTemplateRepository: dataSource.getRepository(ChecklistTemplate),
    itemTemplateRepository: dataSource.getRepository(ItemTemplate),
    workflowRepository: dataSource.getRepository(Workflow),
    checklistRepository: dataSource.getRepository(Checklist),
    itemRepository: dataSource.getRepository(Item),
  };
}

export function getServices() {
  const dataSource = getDataSource();
  const repositories = getRepositories();

  const templatesService = new TemplatesService(
    repositories.workflowTemplateRepository,
    repositories.checklistTemplateRepository,
    repositories.itemTemplateRepository,
    repositories.workflowRepository,
    repositories.checklistRepository,
    repositories.itemRepository,
    dataSource,
  );

  const transactionService = new TransactionsService(
    repositories.transactionRepository,
    repositories.userRepository,
    repositories.propertyRepository,
    repositories.workflowTemplateRepository,
    templatesService,
    dataSource,
  );

  const checklistService = new ChecklistService(
    repositories.checklistRepository,
  );
  const itemService = new ItemService(repositories.itemRepository);

  return {
    templatesService,
    transactionService,
    checklistService,
    itemService,
  };
}
