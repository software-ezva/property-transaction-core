import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
  ): Promise<Transaction> {
    try {
      const { propertyId, agentId, clientId, transactionType } =
        createTransactionDto;

      // Fetch property and agent entities
      const property = await this.propertyRepository.findOne({
        where: { id: propertyId },
      });

      if (!property) {
        this.logger.warn(`Property with ID ${propertyId} not found`);
        throw new NotFoundException(`Property with ID ${propertyId} not found`);
      }

      const agent = await this.userRepository.findOne({
        where: { id: agentId },
        relations: ['profile'],
      });

      if (!agent) {
        this.logger.warn(`User with ID ${agentId} not found`);
        throw new NotFoundException(`User with ID ${agentId} not found`);
      }

      // Optionally fetch client if clientId is provided
      let client: User | null = null;
      if (clientId) {
        client = await this.userRepository.findOne({
          where: { id: clientId },
          relations: ['profile'],
        });

        if (!client) {
          this.logger.warn(`Client with ID ${clientId} not found`);
          throw new NotFoundException(`Client with ID ${clientId} not found`);
        }
      }

      // Create transaction using existing business logic
      const transaction = await this.createTransaction(property, agent);

      // Assign workflow template based on transaction type
      const result = await this.chooseWorkflowTemplate(
        transactionType,
        transaction,
      );

      this.logger.log(
        `Transaction created successfully with ID: ${result.transaction.transactionId} and workflow assigned`,
      );

      return result.transaction;
    } catch (error) {
      this.logger.error(
        `Failed to create transaction for property ID: ${createTransactionDto.propertyId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  findAll() {
    // TODO: Implement actual transaction retrieval logic
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    // TODO: Implement actual transaction retrieval by ID logic
    return `This action returns a #${id} transaction`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, _updateTransactionDto: UpdateTransactionDto) {
    // TODO: Implement actual transaction update logic
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    this.logger.log(`Removing transaction with ID: ${id}`);
    // TODO: Implement actual transaction removal logic
    return `This action removes a #${id} transaction`;
  }

  async createTransaction(
    property: Property,
    agent: User,
  ): Promise<Transaction> {
    try {
      // Validate that the user is a real estate agent
      if (!agent.isRealEstateAgent()) {
        this.logger.warn(
          `User ${agent.id} is not a real estate agent, cannot create transaction`,
        );
        throw new UserIsNotRealEstateAgentException();
      }

      // Create new transaction
      const newTransaction = this.transactionRepository.create({
        property: property,
        agent: agent,
        status: this.CREATION_STATUS,
      });

      const savedTransaction =
        await this.transactionRepository.save(newTransaction);
      this.logger.log(
        `Transaction created successfully with ID: ${savedTransaction.transactionId}`,
      );
      return savedTransaction;
    } catch (error) {
      this.logger.error(
        `Failed to create transaction for property ${property.id} with agent ${agent.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async haveTransaction(property: Property, agent: User): Promise<boolean> {
    this.logger.log(
      `Checking if transaction exists for property ${property.id} with agent ${agent.id}`,
    );

    try {
      const count = await this.transactionRepository.count({
        where: {
          property: { id: property.id },
          agent: { id: agent.id },
        },
      });
      const hasTransaction = count > 0;
      this.logger.log(
        `Transaction ${hasTransaction ? 'exists' : 'does not exist'} for property ${property.id} with agent ${agent.id}`,
      );
      return hasTransaction;
    } catch (error) {
      this.logger.error(
        `Error checking transaction existence for property ${property.id} with agent ${agent.id}`,
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

  async findOneEntity(id: string): Promise<Transaction> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { transactionId: parseInt(id) },
        relations: ['property', 'agent', 'workflow'],
      });

      if (!transaction) {
        this.logger.warn(`Transaction with ID ${id} not found`);
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }

      this.logger.log(`Transaction with ID ${id} found successfully`);
      return transaction;
    } catch (error) {
      this.logger.error(
        `Error finding transaction with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
