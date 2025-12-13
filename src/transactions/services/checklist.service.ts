import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checklist } from '../entities/checklist.entity';
import { Workflow } from '../entities/workflow.entity';
import { CreateChecklistDto } from '../dto/create-checklist.dto';
import { TransactionAuthorizationService } from './transaction-authorization.service';
import { WorkflowService } from './workflow.service';

@Injectable()
export class ChecklistService {
  private readonly logger = new Logger(ChecklistService.name);

  constructor(
    @InjectRepository(Checklist)
    private checklistRepository: Repository<Checklist>,
    private readonly transactionAuthorizationService: TransactionAuthorizationService,
    private readonly workflowService: WorkflowService,
  ) {}

  async createChecklist(
    transactionId: string,
    createChecklistDto: CreateChecklistDto,
    userAuth0Id: string,
  ): Promise<Checklist> {
    // Verify that the user has access to this transaction and get the workflow
    await this.transactionAuthorizationService.verifyUserCanAccessTransaction(
      transactionId,
      userAuth0Id,
    );

    const workflow =
      await this.workflowService.getWorkflowEntityByTransactionId(
        transactionId,
      );

    return this.addChecklistToWorkflow(createChecklistDto.name, workflow);
  }

  async addChecklistToWorkflow(
    checklistName: string,
    workflow: Workflow,
  ): Promise<Checklist> {
    // Calculate the next order number
    const result = await this.checklistRepository
      .createQueryBuilder('checklist')
      .select('MAX(checklist.order)', 'max')
      .where('checklist.workflowId = :workflowId', { workflowId: workflow.id })
      .getRawOne<{ max: string | null }>();

    const maxOrder =
      result && result.max !== null ? parseInt(result.max, 10) : 0;
    const newOrder = maxOrder + 1;

    const checklist = this.checklistRepository.create({
      name: checklistName,
      workflow: workflow,
      order: newOrder,
    });

    const savedChecklist = await this.checklistRepository.save(checklist);
    this.logger.log(
      `Checklist "${checklistName}" added successfully to workflow ${workflow.id} with order ${newOrder}`,
    );
    return savedChecklist;
  }

  async getChecklistById(checklistId: string): Promise<Checklist> {
    const checklist = await this.checklistRepository.findOne({
      where: { id: checklistId },
      relations: ['workflow', 'workflow.transaction'],
    });
    if (!checklist) {
      throw new Error(`Checklist with ID ${checklistId} not found`);
    }
    return checklist;
  }
}
