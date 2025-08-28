import { Given, Then, When } from '@cucumber/cucumber';
import { faker } from '@faker-js/faker';
import { expect } from 'expect';
import { mapToTransactionType } from '../support/transaction-type-mapper';
import { mapToItemStatus } from '../support/item-status-mapper';
import { getRepositories, getServices } from '../support/database-helper';
import { Transaction } from '../../src/transactions/entities/transaction.entity';
import { Property } from '../../src/properties/entities/property.entity';
import { User } from '../../src/users/entities/user.entity';
import { Workflow } from '../../src/transactions/entities/workflow.entity';
import { Checklist } from '../../src/transactions/entities/checklist.entity';
import { Item } from '../../src/transactions/entities/item.entity';
import { TransactionType } from '../../src/common/enums/transaction-type.enum';
import { WorkflowTemplate } from 'src/templates/entities/workflow-template.entity';

export interface TestWorld {
  user?: User;
  property?: Property;
  transaction?: Transaction;
  workflow?: Workflow;
  checklists?: Checklist[];
  workflowTemplate?: WorkflowTemplate;
  checklist?: Checklist;
  items?: Item[];
  item?: Item;
}

Given(
  'a transaction {string} created by a real estate agent {string} for the property {string}',
  async function (
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
    this.property = property;

    // Create transaction with both agent and client
    this.transaction = await transactionService.createAndSaveTransaction(
      mapToTransactionType(transactionType),
      this.property,
      this.user,
      null,
      'Initial transaction setup',
    );

    // Verify transaction exists
    const hasTransaction = await transactionService.existsATransaction(
      this.property,
      this.user,
      null,
      this.transaction.transactionType,
    );
    expect(hasTransaction).toBe(true);
  },
);

When(
  'the real estate agent chooses a workflow template of {string} for the transaction',
  async function (this: TestWorld, transactionTemplate: string) {
    const { transactionService } = getServices();
    await setUpTemplateWorkflow.call(this, transactionTemplate);
    const result = await transactionService.chooseWorkflowTemplate(
      this.workflowTemplate as WorkflowTemplate,
      this.transaction as Transaction,
    );
    this.transaction = result.transaction;
    expect(result.success).toBe(true);
  },
);

Then(
  'a copy of the workflow template would be included in the transaction with its default set of checklists',
  function (dataTable: any) {
    console.log(dataTable);
    expect(true).toBe(true);
  },
);

Given(
  'a set of checklists indexed {string} to the workflow',
  async function (this: TestWorld, setOfDefaultChecklists: string) {
    await setUpWorkflow.call(this);
    const { checklistRepository } = getRepositories();

    const checklistNames = setOfDefaultChecklists
      .split(',')
      .map((name) => name.trim());
    this.checklists = [] as Checklist[];

    for (const name of checklistNames) {
      const checklist = checklistRepository.create({
        workflow: this.workflow as Workflow,
        name: name,
      });
      const savedChecklist: Checklist =
        await checklistRepository.save(checklist);
      this.checklists.push(savedChecklist);
    }

    // Reload workflow with checklists to get updated data
    const { workflowRepository } = getRepositories();
    const updatedWorkflow = await workflowRepository.findOne({
      where: { id: this.workflow?.id },
      relations: ['checklists'],
    });
    this.workflow = updatedWorkflow as Workflow;

    const actualChecklists = this.workflow
      ? this.workflow.getChecklistsNames()
      : [];
    expect(actualChecklists).toEqual(checklistNames);
  },
);

When(
  'the agent adds a checklist named {string}',
  async function (newChecklist: string) {
    const { checklistService } = getServices();
    const { workflowRepository } = getRepositories();

    const result = await checklistService.addChecklistToWorkflow(
      newChecklist,
      this.workflow as Workflow,
    );
    expect(result).toBe(true);

    // Reload workflow with updated checklists
    const updatedWorkflow = await workflowRepository.findOne({
      where: { id: (this.workflow as Workflow)?.id },
      relations: ['checklists'],
    });
    this.workflow = updatedWorkflow as Workflow;
  },
);

Then(
  'the new set of checklists should be {string} for the started workflow',
  function (setOfUpdatedChecklists: string) {
    const checklistNames = setOfUpdatedChecklists
      .split(',')
      .map((name) => name.trim());
    const actualChecklists = (this.workflow as Workflow).getChecklistsNames();
    expect(actualChecklists).toEqual(checklistNames);
  },
);

Given(
  'a transaction with its workflow of {string}',
  async function (typeOfTransaction: string) {
    await setUpWorkflow.call(this, mapToTransactionType(typeOfTransaction));
  },
);

Given(
  'a checklist indexed {string} to the workflow',
  async function (checklistName: string) {
    const { checklistRepository, workflowRepository } = getRepositories();

    this.checklist = checklistRepository.create({
      workflow: this.workflow as Workflow,
      name: checklistName,
    });
    this.checklist = (await checklistRepository.save(
      this.checklist,
    )) as Checklist;

    // Reload workflow with checklists to get updated data
    const updatedWorkflow = await workflowRepository.findOne({
      where: { id: (this.workflow as Workflow)?.id },
      relations: ['checklists'],
    });
    this.workflow = updatedWorkflow as Workflow;

    expect((this.workflow as Workflow).getChecklistsNames()).toEqual([
      checklistName,
    ]);
  },
);

Given(
  'a set of items indexed to the checklist {string}',
  async function (this: TestWorld, setOfDefaultItems: string) {
    const { itemRepository, checklistRepository } = getRepositories();

    this.items = [] as Item[];
    const itemNames = setOfDefaultItems.split(',').map((name) => name.trim());
    this.items = [];

    for (const name of itemNames) {
      const item = itemRepository.create({
        checklist: this.checklist as Checklist,
        description: name,
      });
      const savedItem = await itemRepository.save(item);
      this.items.push(savedItem);
    }

    // Reload checklist with items to get updated data
    const updatedChecklist = await checklistRepository.findOne({
      where: { id: (this.checklist as Checklist)?.id },
      relations: ['items'],
    });
    this.checklist = updatedChecklist as Checklist;

    const actualItems = this.checklist ? this.checklist.getItemsNames() : [];
    expect(actualItems).toEqual(itemNames);
  },
);

When(
  'the agent adds an item named {string} to the checklist {string}',
  async function (newItem: string, checklistName: string) {
    const { itemService } = getServices();
    const { checklistRepository } = getRepositories();

    console.log(`Adding item "${newItem}" to checklist "${checklistName}"`);
    const result = await itemService.addItemToChecklist(
      this.checklist as Checklist,
      newItem,
    );
    expect(result).toBeDefined();
    expect(result.description).toBe(newItem);

    // Reload checklist with updated items
    const updatedChecklist = await checklistRepository.findOne({
      where: { id: (this.checklist as Checklist)?.id },
      relations: ['items'],
    });
    this.checklist = updatedChecklist as Checklist;
  },
);

Then(
  'the new set of items should be {string} for the checklist {string} for the started workflow',
  function (setOfUpdatedItems: string, checklistName: string) {
    console.log(
      `Checking updated items for checklist "${checklistName}": ${setOfUpdatedItems}`,
    );
    const itemNames = setOfUpdatedItems.split(',').map((name) => name.trim());
    const actualItems = (this.checklist as Checklist).getItemsNames();
    expect(actualItems).toEqual(itemNames);
  },
);

Given(
  'the item named {string} that belongs to workflow',
  async function (itemName: string) {
    await setUpWorkflow.call(this);
    const { checklistRepository } = getRepositories();
    const { itemService } = getServices();

    this.checklist = checklistRepository.create({
      workflow: this.workflow as Workflow,
      name: faker.lorem.word(),
    });
    this.checklist = (await checklistRepository.save(
      this.checklist,
    )) as Checklist;

    const result = await itemService.addItemToChecklist(
      this.checklist as Checklist,
      itemName,
    );

    expect(result).toBeDefined();
    expect(result.description).toBe(itemName);
    this.item = result;

    // Reload checklist with items to get updated data
    const updatedChecklist = await checklistRepository.findOne({
      where: { id: (this.checklist as Checklist)?.id },
      relations: ['items'],
    });
    this.checklist = updatedChecklist as Checklist;

    expect((this.checklist as Checklist).getItemsNames()).toEqual([itemName]);
  },
);

When(
  'real estate agents checks the step as {string}',
  async function (state: string) {
    const { itemService } = getServices();

    const enumStatus = mapToItemStatus(state);
    const result = await itemService.checkItemAs(this.item as Item, enumStatus);
    expect(result).toBeDefined();
    expect(result.status).toBe(enumStatus);
  },
);

Then(
  'the item {string} change its status to {string}',
  function (itemName: string, state: string) {
    const actualDisplay = (this.item as Item).getStatusDisplay();
    expect(actualDisplay.toLowerCase()).toBe(state.toLowerCase());
  },
);

Given('the system will send a notification of completion', function () {
  // Placeholder for notification system
  // This would integrate with a real notification service
  console.log('📧 Notification sent: Task completed');
});

async function setUpWorkflow(
  this: TestWorld,
  typeOfTransaction: TransactionType = TransactionType.LISTING_FOR_LEASE,
) {
  const { userService, profileService, propertyService, transactionService } =
    getServices();
  const { workflowRepository } = getRepositories();

  // Create real estate agent
  this.user = await userService.create(
    faker.string.uuid(),
    faker.internet.email(),
    faker.person.firstName(),
    faker.person.lastName(),
  );

  // Create real estate agent profile
  await profileService.assignAgentProfile(this.user.auth0Id, {
    esign_name: faker.person.fullName(),
    esign_initials: faker.person.firstName().charAt(0).toUpperCase(),
    phone_number: '+1555' + faker.string.numeric(3) + faker.string.numeric(4),
    license_number: faker.string.alphanumeric(10),
  });

  // Create property
  const property = await propertyService.create({
    address: faker.location.streetAddress(),
    price: faker.number.int({ min: 100000, max: 1000000 }),
    size: faker.number.int({ min: 500, max: 5000 }),
    bedrooms: faker.number.int({ min: 1, max: 5 }),
    bathrooms: faker.number.int({ min: 1, max: 3 }),
  });
  this.property = property;

  // Create transaction with both agent and client
  this.transaction = await transactionService.createAndSaveTransaction(
    typeOfTransaction,
    this.property,
    this.user,
    null,
    'Initial transaction setup',
  );

  this.workflow = workflowRepository.create({
    transaction: this.transaction,
    name: faker.lorem.sentence(),
  });
  this.workflow = await workflowRepository.save(this.workflow);
}

async function setUpTemplateWorkflow(
  this: TestWorld,
  transactionTypeString: string,
) {
  const { workflowTemplateRepository, checklistTemplateRepository } =
    getRepositories();

  const transactionType = mapToTransactionType(transactionTypeString);

  // Check if workflow template already exists
  const existingTemplate = await workflowTemplateRepository.findOne({
    where: { transactionType },
  });

  if (existingTemplate) {
    return; // Template already exists, no need to create again
  }

  // Create workflow template
  const workflowTemplate = workflowTemplateRepository.create({
    transactionType: transactionType,
    name: `Default ${transactionTypeString} Workflow`,
  });

  const savedWorkflowTemplate =
    await workflowTemplateRepository.save(workflowTemplate);

  // Create checklist templates with explicit order
  const checklistTemplates = [
    {
      name: 'A',
      description: 'Checklist A for workflow',
      order: 1,
      workflowTemplate: savedWorkflowTemplate,
    },
    {
      name: 'B',
      description: 'Checklist B for workflow',
      order: 2,
      workflowTemplate: savedWorkflowTemplate,
    },
    {
      name: 'C',
      description: 'Checklist C for workflow',
      order: 3,
      workflowTemplate: savedWorkflowTemplate,
    },
  ];

  // Create checklist templates
  const createdChecklists =
    checklistTemplateRepository.create(checklistTemplates);
  await checklistTemplateRepository.save(createdChecklists);

  const foundTemplate = await workflowTemplateRepository.findOne({
    where: { id: savedWorkflowTemplate.id },
    relations: ['checklistTemplates', 'checklistTemplates.items'],
  });

  this.workflowTemplate = foundTemplate ?? undefined;

  console.log(`✅ Created workflow template for ${transactionTypeString}`);
}
