import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionWithSummaryInfo } from '../interfaces/transaction-with-summary-info.interface';
import { TransactionWithDetailedInfo } from '../interfaces/transaction-with-detailed-info.interface';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { WorkflowAnalyticsService } from '../workflow-analytics.service';
import { TemplatesService } from '../../templates/services/templates.service';
import { TransactionType, TransactionStatus } from '../../common/enums';
import {
  WorkflowTemplateDoesNotExistException,
  DuplicateTransactionException,
  TransactionNotFoundException,

  SupportingProfessionalNotFoundException,
  SupportingProfessionalAlreadyAssignedException,
} from '../expections';
import { UserIsNotRealEstateAgentException } from '../../users/exceptions';
import { UsersService } from '../../users/services/users.service';
import { PropertiesService } from '../../properties/properties.service';
import { WorkflowTemplate } from 'src/templates/entities/workflow-template.entity';
import { TransactionAuthorizationService } from './transaction-authorization.service';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private readonly CREATION_STATUS = TransactionStatus.IN_PREPARATION;

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private templatesService: TemplatesService,
    private readonly userService: UsersService,
    private readonly propertyService: PropertiesService,
    private readonly workflowAnalyticsService: WorkflowAnalyticsService,
    private readonly transactionAuthorizationService: TransactionAuthorizationService,
    private dataSource: DataSource,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    agentId: string,
  ): Promise<Transaction> {
    const { propertyId, clientId, workflowTemplateId, additionalNotes } =
      createTransactionDto;
    try {
      // Fetch agent, client(optional) and property
      const agent = await this.userService.getUserByAuth0Id(agentId);
      if (!agent.isRealEstateAgent()) {
        this.logger.warn(`User with ID ${agentId} is not a real estate agent`);
        throw new UserIsNotRealEstateAgentException();
      }
      const property = await this.propertyService.findOne(propertyId);
      const workflowTemplate =
        await this.templatesService.findOne(workflowTemplateId);
      const client = clientId
        ? await this.userService.getUserById(clientId)
        : null;

      // Check for duplicate transaction
      if (
        await this.existsATransaction(
          property,
          agent,
          client,
          workflowTemplate.transactionType,
        )
      ) {
        this.logger.warn('Duplicate transaction found');
        throw new DuplicateTransactionException(
          'A transaction with the same property, agent, client, and transaction type already exists',
        );
      }

      // Create and save transaction
      const transaction = await this.createAndSaveTransaction(
        workflowTemplate.transactionType,
        property,
        agent,
        client,
        additionalNotes,
      );

      await this.chooseWorkflowTemplate(workflowTemplate, transaction);

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

  async findAll(userId: string): Promise<TransactionWithSummaryInfo[]> {
    const user = await this.userService.getUserByAuth0Id(userId);
    // get role and build a where clause dynamically
    const userRole = user.isRealEstateAgent() ? 'agent' : 'client';
    const whereClause = { [userRole]: { id: user.id } };

    const transactions = await this.transactionRepository.find({
      where: whereClause,
      relations: [
        'property',
        'agent',
        'client',
        'workflow',
        'workflow.checklists',
        'workflow.checklists.items',
      ],
      order: { createdAt: 'DESC' },
    });

    this.logger.log(
      `Retrieved ${transactions.length} transactions for ${userRole} ${userId}`,
    );

    return transactions.map((transaction) => ({
      transaction,
      propertyAddress: transaction.property.address,
      propertyValue: Number(transaction.property.price),
      clientName: transaction.client ? transaction.client.fullName : null,
      totalWorkflowItems:
        this.workflowAnalyticsService.calculateTotalWorkflowItems(transaction),
      completedWorkflowItems:
        this.workflowAnalyticsService.calculateCompletedWorkflowItems(
          transaction,
        ),
      nextIncompleteItemDate:
        this.workflowAnalyticsService.getNextIncompleteItemDate(transaction),
    }));
  }

  async findOne(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId: transactionId },
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
      this.logger.warn(`Transaction with ID ${transactionId} not found`);
      throw new TransactionNotFoundException(transactionId);
    }

    this.logger.log(
      `Transaction with ID ${transactionId} retrieved successfully`,
    );
    return transaction;
  }

  async findOneWithDetails(
    transactionId: string,
    userId: string,
  ): Promise<TransactionWithDetailedInfo> {
    // First verify that the user has access to this transaction
    await this.transactionAuthorizationService.verifyUserCanAccessTransaction(
      transactionId,
      userId,
    );
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId },
      relations: [
        'property',
        'agent',
        'agent.profile',
        'client',
        'client.profile',
        'workflow',
        'workflow.checklists',
        'workflow.checklists.items',
      ],
    });

    if (!transaction) {
      this.logger.warn(`Transaction with ID ${transactionId} not found`);
      throw new TransactionNotFoundException(transactionId);
    }

    // Build the detailed response following findAll pattern
    const result = {
      transaction,
      propertyAddress: transaction.property?.address || null,
      propertyPrice: transaction.property?.price || null,
      propertySize: transaction.property?.size || null,
      propertyBedrooms: transaction.property?.bedrooms || null,
      propertyBathrooms: transaction.property?.bathrooms || null,
      clientName: transaction.client?.fullName || null,
      clientEmail: transaction.client?.email || null,
      clientPhoneNumber: transaction.client?.profile?.phoneNumber || null,
      totalWorkflowItems:
        this.workflowAnalyticsService.calculateTotalWorkflowItems(transaction),
      completedWorkflowItems:
        this.workflowAnalyticsService.calculateCompletedWorkflowItems(
          transaction,
        ),
      nextIncompleteItemDate:
        this.workflowAnalyticsService.getNextIncompleteItemDate(transaction),
    };

    this.logger.log(
      `Transaction details with ID ${transactionId} retrieved successfully`,
    );
    return result;
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    this.logger.log(`Updating transaction with ID: ${id}`);

    try {
      const transaction = await this.findOne(id);

      // Handle clientId update separately as it's a relation
      if (updateTransactionDto.clientId !== undefined) {
        try {
          const client = await this.userService.getUserById(
            updateTransactionDto.clientId,
          );
          transaction.client = client;
          this.logger.log(
            `Client assigned to transaction ${id}: ${updateTransactionDto.clientId}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to assign client ${updateTransactionDto.clientId} to transaction ${id}`,
            error,
          );
          throw new Error(
            `Client with ID '${updateTransactionDto.clientId}' does not exist in the system. Please verify the client ID is correct and the user is registered.`,
          );
        }
      }

      // Update other simple fields
      if (updateTransactionDto.status !== undefined) {
        transaction.status = updateTransactionDto.status;
      }

      if (updateTransactionDto.additionalNotes !== undefined) {
        transaction.additionalNotes = updateTransactionDto.additionalNotes;
      }

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

  async remove(id: string): Promise<{ success: boolean; message: string }> {
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
        throw new TransactionNotFoundException(id);
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

      if (error instanceof TransactionNotFoundException) {
        throw error;
      }

      throw new Error(`Failed to remove transaction: ${error}`);
    }
  }

  async chooseWorkflowTemplate(
    workflowTemplate: WorkflowTemplate,
    transactionObject: Transaction,
  ): Promise<{ success: boolean; transaction: Transaction }> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        if (!workflowTemplate) {
          this.logger.warn(
            `Workflow template does not exist for transaction type: ${transactionObject.transactionType}`,
          );
          throw new WorkflowTemplateDoesNotExistException();
        }

        // Clone the workflow template to create a workflow instance
        const clonedWorkflow =
          await this.templatesService.cloneWorkflowTemplateToInstance(
            workflowTemplate,
          );

        transactionObject.workflow = clonedWorkflow;

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

  async existsATransaction(
    property: Property,
    agent: User,
    client: User | null,
    transactionType: TransactionType,
  ): Promise<boolean> {
    const whereCondition = {
      property: { id: property.id },
      agent: { id: agent.id },
      transactionType,
      ...(client ? { client: { id: client.id } } : { client: IsNull() }),
    };

    const existingTransaction = await this.transactionRepository.findOne({
      where: whereCondition,
      relations: ['property', 'agent', 'client'],
    });
    return !!existingTransaction;
  }

  async createAndSaveTransaction(
    transactionType: TransactionType,
    property: Property,
    agent: User,
    client: User | null,
    additionalNotes?: string,
  ): Promise<Transaction> {
    const newTransaction = this.transactionRepository.create({
      transactionType,
      property,
      agent,
      status: this.CREATION_STATUS,
      additionalNotes,
      client: client ?? undefined,
    });

    return await this.transactionRepository.save(newTransaction);
  }

  async addSupportingProfessionalToTransaction(
    agentAuth0Id: string,
    transactionId: string,
    professionalId: string,
  ): Promise<void> {
    // Verify that the agent can access this transaction
    await this.transactionAuthorizationService.verifyUserCanAccessTransaction(
      transactionId,
      agentAuth0Id,
    );

    // Get the professional user
    const professional = await this.userService.getUserById(professionalId);

    // Verify that the user is actually a supporting professional
    if (!professional.isSupportingProfessional()) {
      this.logger.warn(
        `User with ID ${professionalId} is not a supporting professional`,
      );
      throw new SupportingProfessionalNotFoundException(professionalId);
    }

    // Get transaction WITH current supporting professionals
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId },
      relations: ['supportingProfessionals'],
    });

    if (!transaction) {
      throw new TransactionNotFoundException(transactionId);
    }

    const isAlreadyAssigned = transaction.supportingProfessionals.some(
      (sp) => sp.id === professionalId,
    );

    if (isAlreadyAssigned) {
      throw new SupportingProfessionalAlreadyAssignedException(
        professionalId,
        transactionId,
      );
    }

    // Add the professional to the transaction
    transaction.supportingProfessionals.push(professional);
    await this.transactionRepository.save(transaction);

    this.logger.log(
      `Supporting professional ${professionalId} added to transaction ${transactionId} by agent ${agentAuth0Id}`,
    );
  }

  async getSupportingProfessionalsForTransaction(
    agentAuth0Id: string,
    transactionId: string,
  ): Promise<User[]> {
    // Verify that the agent can access this transaction
    await this.transactionAuthorizationService.verifyUserCanAccessTransaction(
      transactionId,
      agentAuth0Id,
    );

    const transaction = await this.transactionRepository.findOne({
      where: { transactionId },
      relations: ['supportingProfessionals', 'supportingProfessionals.profile'],
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction.supportingProfessionals;
  }
}
