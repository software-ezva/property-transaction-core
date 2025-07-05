import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { WorkflowTemplate } from '../templates/entities/workflow-template.entity';
import { TemplatesService } from '../templates/templates.service';
import { TransactionType } from '../common/enums';
import {
  UserIsNotRealEstateAgentException,
  WorkflowTemplateDoesNotExistException,
  InvalidTransactionDataException,
  DuplicateTransactionException,
  PropertyNotFoundException,
  UserNotFoundException,
  TransactionNotFoundException,
} from '../common/exceptions';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private readonly CREATION_STATUS = 'active';

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(WorkflowTemplate)
    private workflowTemplateRepository: Repository<WorkflowTemplate>,
    private templatesService: TemplatesService,
    private dataSource: DataSource,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    agent: User,
  ): Promise<Transaction> {
    const { propertyId, clientId, transactionType, additionalNotes } =
      createTransactionDto;

    this.logger.log(
      `Creating transaction for property ${propertyId}, agent ${agent.id}, type ${transactionType}`,
    );

    try {
      // Validate input parameters
      this.validateCreateInput(agent, propertyId, clientId);

      // Fetch related entities
      const property = await this.findPropertyOrFail(propertyId);
      const client = clientId ? await this.findClientOrFail(clientId) : null;

      // Check for duplicate transaction
      await this.validateNoDuplicateTransaction(
        property,
        agent,
        client,
        transactionType,
      );

      // Create and save transaction
      const transaction = await this.createAndSaveTransaction(
        property,
        agent,
        client,
        transactionType,
        additionalNotes,
      );

      this.logger.log(
        `Transaction created successfully with ID: ${transaction.transactionId}`,
      );

      return transaction;
    } catch (error) {
      this.logger.error(
        `Failed to create transaction for property ID: ${propertyId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async findAll(): Promise<Transaction[]> {
    try {
      const transactions = await this.transactionRepository.find({
        relations: ['property', 'agent', 'client', 'workflow'],
        order: { createdAt: 'DESC' },
      });

      this.logger.log(`Retrieved ${transactions.length} transactions`);
      return transactions;
    } catch (error) {
      this.logger.error(
        'Failed to retrieve transactions',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async findOne(id: number): Promise<Transaction> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { transactionId: id },
        relations: [
          'property',
          'agent',
          'client',
          'workflow',
          'workflow.checklists',
          'workflow.checklists.items',
        ],
      });

      if (!transaction) {
        this.logger.warn(`Transaction with ID ${id} not found`);
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }

      this.logger.log(`Transaction with ID ${id} retrieved successfully`);
      return transaction;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve transaction with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async update(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    this.logger.log(`Updating transaction with ID: ${id}`);

    try {
      const transaction = await this.findOne(id);

      // Update only provided fields
      Object.assign(transaction, updateTransactionDto);

      const updatedTransaction =
        await this.transactionRepository.save(transaction);

      this.logger.log(`Transaction with ID ${id} updated successfully`);
      return updatedTransaction;
    } catch (error) {
      this.logger.error(
        `Failed to update transaction with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Removing transaction with ID: ${id}`);

    try {
      // First, find the transaction with all its relations
      const transaction = await this.transactionRepository.findOne({
        where: { transactionId: id },
        relations: [
          'workflow',
          'workflow.checklists',
          'workflow.checklists.items',
        ],
      });

      if (!transaction) {
        this.logger.warn(`Transaction with ID ${id} not found`);
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }

      // Remove the transaction (CASCADE will handle workflow, checklists, and items)
      await this.transactionRepository.remove(transaction);

      this.logger.log(
        `Transaction with ID ${id} and all related data removed successfully`,
      );

      return {
        success: true,
        message: `Transaction ${id} and all related data deleted successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to remove transaction with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new Error(`Failed to remove transaction: ${error}`);
    }
  }

  private async createBaseTransaction(
    property: Property,
    agent: User,
    additionalNotes?: string,
  ): Promise<Transaction> {
    // Validate that the user is a real estate agent
    if (!agent.isRealEstateAgent()) {
      this.logger.warn(
        `User ${agent.id} is not a real estate agent, cannot create transaction`,
      );
      throw new UserIsNotRealEstateAgentException();
    }

    // Create new transaction
    const newTransaction = this.transactionRepository.create({
      property,
      agent,
      status: this.CREATION_STATUS,
      additionalNotes,
    });

    return await this.transactionRepository.save(newTransaction);
  }

  async findDuplicateTransaction(
    property: Property,
    agent: User,
    client: User | null,
    transactionType: TransactionType,
  ): Promise<Transaction | null> {
    try {
      const whereCondition = {
        property: { id: property.id },
        agent: { id: agent.id },
        transactionType,
        status: 'active',
        ...(client ? { client: { id: client.id } } : { client: IsNull() }),
      };

      const existingTransaction = await this.transactionRepository.findOne({
        where: whereCondition,
        relations: ['property', 'agent', 'client'],
      });

      if (existingTransaction) {
        this.logger.log(
          `Duplicate transaction found with ID: ${existingTransaction.transactionId}`,
        );
      }
      return existingTransaction;
    } catch (error) {
      this.logger.error(
        'Error checking for duplicate transaction',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async chooseWorkflowTemplate(
    transactionType: TransactionType,
    transactionObject: Transaction,
  ): Promise<{ success: boolean; transaction: Transaction }> {
    try {
      // Check if workflow template exists
      const templateExists =
        await this.templatesService.existsWorkflowTemplate(transactionType);
      if (!templateExists) {
        this.logger.warn(
          `Workflow template does not exist for transaction type: ${transactionType}`,
        );
        throw new WorkflowTemplateDoesNotExistException();
      }

      return await this.dataSource.transaction(async (manager) => {
        // Get the workflow template with relations
        const workflowTemplate =
          await this.templatesService.getWorkflowTemplate(transactionType);

        if (!workflowTemplate) {
          throw new WorkflowTemplateDoesNotExistException();
        }

        // Clone the workflow template to create a workflow instance
        const clonedWorkflow =
          await this.templatesService.cloneWorkflowTemplateToInstance(
            workflowTemplate,
          );

        transactionObject.workflow = clonedWorkflow;
        transactionObject.transactionType = transactionType;

        const updatedTransaction = await manager.save(
          Transaction,
          transactionObject,
        );

        this.logger.log(
          `Workflow template assigned successfully to transaction ${transactionObject.transactionId}`,
        );
        return { success: true, transaction: updatedTransaction };
      });
    } catch (error) {
      this.logger.error(
        `Error choosing workflow template for transaction ${transactionObject.transactionId}`,
        error instanceof Error ? error.stack : String(error),
      );
      if (
        error instanceof UserIsNotRealEstateAgentException ||
        error instanceof WorkflowTemplateDoesNotExistException
      ) {
        throw error;
      }
      throw new Error(`Error choosing workflow template: ${error}`);
    }
  }

  // Private utility methods for better code organization
  private validateCreateInput(
    agent: User,
    propertyId: number,
    clientId?: number,
  ): void {
    if (!agent) {
      throw new InvalidTransactionDataException('Agent parameter is required');
    }

    if (!propertyId || propertyId <= 0) {
      throw new InvalidTransactionDataException(
        'Valid property ID is required',
      );
    }

    if (clientId !== undefined && clientId <= 0) {
      throw new InvalidTransactionDataException(
        'Valid client ID is required when provided',
      );
    }
  }

  private async findPropertyOrFail(propertyId: number): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      this.logger.warn(`Property with ID ${propertyId} not found`);
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    return property;
  }

  private async findClientOrFail(clientId: number): Promise<User> {
    const client = await this.userRepository.findOne({
      where: { id: clientId },
      relations: ['profile'],
    });

    if (!client) {
      this.logger.warn(`Client with ID ${clientId} not found`);
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    return client;
  }

  private async validateNoDuplicateTransaction(
    property: Property,
    agent: User,
    client: User | null,
    transactionType: TransactionType,
  ): Promise<void> {
    const existingTransaction = await this.findDuplicateTransaction(
      property,
      agent,
      client,
      transactionType,
    );

    if (existingTransaction) {
      const clientInfo = client ? `client ${client.id}` : 'no client';
      this.logger.warn(
        `Duplicate transaction found: property ${property.id}, agent ${agent.id}, ${clientInfo}, type ${transactionType}`,
      );
      throw new DuplicateTransactionException(
        'A transaction with the same property, agent, client, and transaction type already exists',
      );
    }
  }

  private async createAndSaveTransaction(
    property: Property,
    agent: User,
    client: User | null,
    transactionType: TransactionType,
    additionalNotes?: string,
  ): Promise<Transaction> {
    // Create transaction using existing business logic
    const transaction = await this.createBaseTransaction(
      property,
      agent,
      additionalNotes,
    );

    // Set client if provided
    if (client) {
      transaction.client = client;
    }

    // Assign workflow template based on transaction type
    const result = await this.chooseWorkflowTemplate(
      transactionType,
      transaction,
    );

    return result.transaction;
  }
}
