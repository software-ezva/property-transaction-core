import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionWithSummaryInfo } from '../interfaces/transaction-with-summary-info.interface';
import { TransactionWithDetailedInfo } from '../interfaces/transaction-with-detailed-info.interface';
import { Transaction } from '../entities/transaction.entity';
import { Property } from '../../properties/entities/property.entity';
import { WorkflowAnalyticsService } from '../workflow-analytics.service';
import { TemplatesService } from '../../templates/services/templates.service';
import {
  TransactionType,
  TransactionStatus,
  ProfileType,
} from '../../common/enums';
import { DuplicateTransactionException } from '../exceptions/duplicate-transaction.exception';
import { TransactionNotFoundException } from '../exceptions/transaction-not-found.exception';
import { SupportingProfessionalNotFoundException } from '../exceptions/supporting-professional-not-found.exception';
import { SupportingProfessionalAlreadyAssignedException } from '../exceptions/supporting-professional-already-assigned.exception';
import { WorkflowTemplateDoesNotExistException } from '../exceptions/workflow-template-does-not-exist.exception';
import { UserIsNotTransactionCoordinatorAgentException } from '../../users/exceptions';
import { UsersService } from '../../users/services/users.service';
import { PropertiesService } from '../../properties/properties.service';
import { WorkflowTemplate } from 'src/templates/entities/workflow-template.entity';
import { TransactionCoordinatorAgentProfile } from '../../users/entities/transaction-coordinator-agent-profile.entity';
import { ClientProfile } from '../../users/entities/client-profile.entity';
import { SupportingProfessionalProfile } from '../../users/entities/supporting-professional-profile.entity';
import { Profile } from '../../users/entities/profile.entity';
import {
  TransactionPeopleResponseDto,
  PersonDto,
  SupportingProfessionalDto,
} from '../dto/transaction-people-response.dto';
import { TransactionAuthorizationService } from './transaction-authorization.service';
import { AccessCodeGenerator } from '../../users/utils/access-code.generator';
import { getTransactionWhereClauseByProfileType } from '../utils/transaction-query.utils';

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
    const { propertyId, workflowTemplateId, additionalNotes } =
      createTransactionDto;
    try {
      // Fetch agent and property
      const agent = await this.userService.getUserByAuth0Id(agentId);
      if (!agent.isTransactionCoordinatorAgent()) {
        this.logger.warn(`User with ID ${agentId} is not a real estate agent`);
        throw new UserIsNotTransactionCoordinatorAgentException();
      }
      const property = await this.propertyService.findOne(propertyId);
      const workflowTemplate =
        await this.templatesService.findOne(workflowTemplateId);

      // Check for duplicate transaction
      if (
        await this.existsATransaction(
          property,
          agent.profile as TransactionCoordinatorAgentProfile,
          null,
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
        agent.profile as TransactionCoordinatorAgentProfile,
        null,
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
    const profileType = user.getProfileType();

    const whereClause = getTransactionWhereClauseByProfileType(
      profileType as ProfileType,
      user.id,
    );

    if (!whereClause) {
      this.logger.warn(
        `User ${userId} has unknown or unsupported profile type for listing transactions: ${profileType}`,
      );
      return [];
    }

    const transactions = await this.transactionRepository.find({
      where: whereClause,
      relations: [
        'property',
        'transactionCoordinatorAgent',
        'transactionCoordinatorAgent.user',
        'client',
        'client.user',
        'workflow',
        'workflow.checklists',
        'workflow.checklists.items',
      ],
      order: { createdAt: 'DESC' },
    });

    this.logger.log(
      `Retrieved ${transactions.length} transactions for user ${userId}`,
    );

    return transactions.map((transaction) => ({
      transaction,
      propertyAddress: transaction.property.address,
      propertyValue: Number(transaction.property.price),
      clientName: transaction.client ? transaction.client.user.fullName : null,
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
        'transactionCoordinatorAgent',
        'transactionCoordinatorAgent.user',
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
        'transactionCoordinatorAgent',
        'transactionCoordinatorAgent.user',
        'client',
        'client.user',
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
      clientName: transaction.client?.user?.fullName || null,
      clientEmail: transaction.client?.user?.email || null,
      clientPhoneNumber: transaction.client?.phoneNumber || null,
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

  async getTransactionPeople(
    transactionId: string,
  ): Promise<TransactionPeopleResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId },
      relations: [
        'client',
        'client.user',
        'realEstateAgent',
        'realEstateAgent.user',
        'supportingProfessionals',
        'supportingProfessionals.user',
      ],
    });

    if (!transaction) {
      throw new TransactionNotFoundException(transactionId);
    }

    const mapPerson = (
      profile: Profile | null | undefined,
    ): PersonDto | null => {
      if (!profile || !profile.user) return null;
      return {
        id: profile.user.id,
        fullName: profile.user.fullName,
        email: profile.user.email,
        phoneNumber: profile.phoneNumber,
      };
    };

    return {
      accessCode: transaction.accessCode,
      client: mapPerson(transaction.client),
      realEstateAgent: mapPerson(transaction.realEstateAgent),
      supportingProfessionals: transaction.supportingProfessionals
        .map((sp) => {
          const person = mapPerson(sp);
          return person ? { ...person, professionOf: sp.professionalOf } : null;
        })
        .filter((sp) => sp !== null) as SupportingProfessionalDto[],
    };
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    this.logger.log(`Updating transaction with ID: ${id}`);

    try {
      const transaction = await this.findOne(id);

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
        error instanceof UserIsNotTransactionCoordinatorAgentException ||
        error instanceof WorkflowTemplateDoesNotExistException
      ) {
        throw error;
      }
      throw new Error(`Error choosing workflow template: ${error}`);
    }
  }

  async existsATransaction(
    property: Property,
    agent: TransactionCoordinatorAgentProfile,
    client: ClientProfile | null,
    transactionType: TransactionType,
  ): Promise<boolean> {
    const whereCondition = {
      property: { id: property.id },
      transactionCoordinatorAgent: { id: agent.id },
      transactionType,
      ...(client ? { client: { id: client.id } } : { client: IsNull() }),
    };

    const existingTransaction = await this.transactionRepository.findOne({
      where: whereCondition,
      relations: ['property', 'transactionCoordinatorAgent', 'client'],
    });
    return !!existingTransaction;
  }

  async createAndSaveTransaction(
    transactionType: TransactionType,
    property: Property,
    agent: TransactionCoordinatorAgentProfile,
    client: ClientProfile | null,
    additionalNotes?: string,
  ): Promise<Transaction> {
    const accessCode = await this.generateUniqueAccessCode();
    const newTransaction = this.transactionRepository.create({
      transactionType,
      property,
      transactionCoordinatorAgent: agent,
      status: this.CREATION_STATUS,
      additionalNotes,
      client: client ?? undefined,
      accessCode,
    });

    return await this.transactionRepository.save(newTransaction);
  }

  private async generateUniqueAccessCode(): Promise<string> {
    let isUnique = false;
    let accessCode = '';

    while (!isUnique) {
      accessCode = AccessCodeGenerator.generate();

      const existingTransaction = await this.transactionRepository.findOne({
        where: { accessCode },
      });

      if (!existingTransaction) {
        isUnique = true;
      }
    }

    return accessCode;
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
    const professionalUser = await this.userService.getUserById(professionalId);

    // Verify that the user is actually a supporting professional
    if (!professionalUser.isSupportingProfessional()) {
      this.logger.warn(
        `User with ID ${professionalId} is not a supporting professional`,
      );
      throw new SupportingProfessionalNotFoundException(professionalId);
    }

    const professionalProfile =
      professionalUser.profile as SupportingProfessionalProfile;

    // Get transaction WITH current supporting professionals
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId },
      relations: ['supportingProfessionals'],
    });

    if (!transaction) {
      throw new TransactionNotFoundException(transactionId);
    }

    const isAlreadyAssigned = transaction.supportingProfessionals.some(
      (sp) => sp.id === professionalProfile.id,
    );

    if (isAlreadyAssigned) {
      throw new SupportingProfessionalAlreadyAssignedException(
        professionalId,
        transactionId,
      );
    }

    // Add the professional to the transaction
    transaction.supportingProfessionals.push(professionalProfile);
    await this.transactionRepository.save(transaction);

    this.logger.log(
      `Supporting professional ${professionalId} added to transaction ${transactionId} by agent ${agentAuth0Id}`,
    );
  }

  async getSupportingProfessionalsForTransaction(
    agentAuth0Id: string,
    transactionId: string,
  ): Promise<SupportingProfessionalProfile[]> {
    // Verify that the agent can access this transaction
    await this.transactionAuthorizationService.verifyUserCanAccessTransaction(
      transactionId,
      agentAuth0Id,
    );

    const transaction = await this.transactionRepository.findOne({
      where: { transactionId },
      relations: ['supportingProfessionals', 'supportingProfessionals.user'],
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction.supportingProfessionals;
  }
}
