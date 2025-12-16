import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowResponseDto } from '../dto/workflow-response.dto';
import { TransactionAuthorizationService } from './transaction-authorization.service';
import { Workflow } from '../entities/workflow.entity';
import { WorkflowNotFoundException } from '../exceptions';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    private readonly transactionAuthorizationService: TransactionAuthorizationService,
  ) {}

  async getWorkflowByTransactionId(
    transactionId: string,
    userAuth0Id: string,
  ): Promise<WorkflowResponseDto> {
    // First verify that the user has access to this transaction
    await this.transactionAuthorizationService.verifyUserCanAccessTransaction(
      transactionId,
      userAuth0Id,
    );
    const workflow = await this.getWorkflowEntityByTransactionId(transactionId);

    const result: WorkflowResponseDto = {
      id: workflow.id,
      name: workflow.name,
      checklists:
        workflow.checklists?.map((checklist) => ({
          id: checklist.id,
          name: checklist.name,
          order: checklist.order,
          items:
            checklist.items?.map((item) => ({
              id: item.id,
              description: item.description,
              order: item.order,
              status: item.status,
              expectClosingDate: item.expectClosingDate,
              updates:
                item.updates?.map((update) => ({
                  id: update.id,
                  content: update.content,
                  createdAt: update.createdAt,
                  createdBy: update.createdBy,
                  createdByName: update.createdByName,
                })) || [],
            })) || [],
        })) || [],
    };

    this.logger.log(
      `Workflow for transaction ${transactionId} retrieved successfully by user ${userAuth0Id}`,
    );
    return result;
  }

  async getWorkflowEntityByTransactionId(
    transactionId: string,
  ): Promise<Workflow> {
    // Find workflow directly by transaction ID
    const workflow = await this.workflowRepository.findOne({
      where: { transaction: { transactionId: transactionId } },
      relations: ['checklists', 'checklists.items', 'checklists.items.updates'],
    });

    if (!workflow) {
      this.logger.warn(`No workflow found for transaction ${transactionId}`);
      throw new WorkflowNotFoundException(transactionId);
    }
    return workflow;
  }
}
