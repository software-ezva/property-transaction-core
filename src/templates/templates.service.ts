import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { WorkflowTemplate } from './entities/workflow-template.entity';
import { ChecklistTemplate } from './entities/checklist-template.entity';
import { ItemTemplate } from './entities/item-template.entity';
import { Workflow } from '../transactions/entities/workflow.entity';
import { Checklist } from '../transactions/entities/checklist.entity';
import { Item } from '../transactions/entities/item.entity';
import { TransactionType } from '../common/enums';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);
  constructor(
    @InjectRepository(WorkflowTemplate)
    private workflowTemplateRepository: Repository<WorkflowTemplate>,
    @InjectRepository(ChecklistTemplate)
    private checklistTemplateRepository: Repository<ChecklistTemplate>,
    @InjectRepository(ItemTemplate)
    private itemTemplateRepository: Repository<ItemTemplate>,
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    @InjectRepository(Checklist)
    private checklistRepository: Repository<Checklist>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    private dataSource: DataSource,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createTemplateDto: CreateTemplateDto) {
    // TODO: Implement actual template creation logic
    return 'This action adds a new template';
  }

  findAll() {
    // TODO: Implement actual template retrieval logic
    return `This action returns all templates`;
  }

  findOne(id: number) {
    // TODO: Implement actual template retrieval by ID logic
    return `This action returns a #${id} template`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateTemplateDto: UpdateTemplateDto) {
    // TODO: Implement actual template update logic
    return `This action updates a #${id} template`;
  }

  remove(id: number) {
    this.logger.log(`Removing template with ID: ${id}`);
    // TODO: Implement actual template removal logic
    return `This action removes a #${id} template`;
  }

  async cloneWorkflowTemplateToInstance(
    workflowTemplate: WorkflowTemplate,
  ): Promise<Workflow> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        // Create new workflow instance
        const newWorkflow = manager.create(Workflow, {
          name: `${workflowTemplate.name} (Copia)`,
        });

        const savedWorkflow = await manager.save(newWorkflow);

        // Clone all checklist templates
        for (const checklistTemplate of workflowTemplate.checklistTemplates) {
          await this.cloneChecklistTemplateToInstance(
            checklistTemplate,
            savedWorkflow,
            manager,
          );
        }

        this.logger.log(
          `Successfully cloned workflow template: ${workflowTemplate.name}`,
        );
        return savedWorkflow;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`Error cloning workflow template: ${errorMessage}`);
        throw new Error(`Error al clonar el workflow: ${errorMessage}`);
      }
    });
  }

  private async cloneChecklistTemplateToInstance(
    template: ChecklistTemplate,
    workflow: Workflow,
    manager: EntityManager,
  ): Promise<void> {
    // Create new checklist instance
    const newChecklist = manager.create(Checklist, {
      workflow: workflow,
      name: template.name,
    });

    const savedChecklist = await manager.save(newChecklist);

    // Clone all item templates
    for (const itemTemplate of template.items) {
      const newItem = manager.create(Item, {
        checklist: savedChecklist,
        description: itemTemplate.description,
      });
      await manager.save(newItem);
    }

    this.logger.debug(
      `Successfully cloned checklist template: ${template.name}`,
    );
  }

  async existsWorkflowTemplate(
    transactionType: TransactionType,
  ): Promise<boolean> {
    this.logger.log(
      `Checking if workflow template exists for type: ${transactionType}`,
    );

    try {
      const count = await this.workflowTemplateRepository.count({
        where: { transactionType },
      });
      const exists = count > 0;
      return exists;
    } catch (error) {
      this.logger.error(
        `Error checking workflow template existence for type: ${transactionType}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async getWorkflowTemplate(
    transactionType: TransactionType,
  ): Promise<WorkflowTemplate | null> {
    this.logger.log(
      `Retrieving workflow template for type: ${transactionType}`,
    );

    try {
      const template = await this.workflowTemplateRepository.findOne({
        where: { transactionType },
        relations: ['checklistTemplates', 'checklistTemplates.items'],
      });

      if (template) {
        this.logger.log(
          `Found workflow template: ${template.name} for type: ${transactionType}`,
        );
      } else {
        this.logger.warn(
          `No workflow template found for type: ${transactionType}`,
        );
      }

      return template;
    } catch (error) {
      this.logger.error(
        `Error retrieving workflow template for type: ${transactionType}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
