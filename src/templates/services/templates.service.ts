import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { CreateTemplateResponseDto } from '../dto/create-template-response.dto';
import { UpdateWorkflowTemplateDto } from '../dto/update-workflow-template-complete.dto';
import { UpdateTemplateResponseDto } from '../dto/update-template-response.dto';
import { TemplateSummaryDto } from '../dto/template-summary.dto';
import { WorkflowTemplate } from '../entities/workflow-template.entity';
import { ChecklistTemplate } from '../entities/checklist-template.entity';
import { Workflow } from '../../transactions/entities/workflow.entity';
import { Checklist } from '../../transactions/entities/checklist.entity';
import { Item } from '../../transactions/entities/item.entity';
import { TransactionType } from '../../common/enums';
import {
  TemplateNotFoundException,
  InvalidTemplateDataException,
} from '../exceptions';
import { ChecklistTemplateService } from '.';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);
  constructor(
    @InjectRepository(WorkflowTemplate)
    private workflowTemplateRepository: Repository<WorkflowTemplate>,
    private checklistTemplateService: ChecklistTemplateService,
    private dataSource: DataSource,
  ) {}

  async create(
    createDto: CreateTemplateDto,
  ): Promise<CreateTemplateResponseDto> {
    if (!createDto.name?.trim()) {
      throw new InvalidTemplateDataException('Template name is required');
    }

    if (
      !createDto.checklistTemplates ||
      createDto.checklistTemplates.length === 0
    ) {
      throw new InvalidTemplateDataException(
        'At least one checklist is required',
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      // 1. Create main workflow template
      const template = manager.create(WorkflowTemplate, {
        name: createDto.name,
        transactionType: createDto.transactionType,
      });

      const savedTemplate = await manager.save(template);

      // 2. Create checklists and items using auxiliary service
      await this.checklistTemplateService.createChecklists(
        manager,
        savedTemplate.id,
        createDto.checklistTemplates,
      );

      this.logger.log(
        `Successfully created workflow template: ${createDto.name} with ${createDto.checklistTemplates.length} checklists`,
      );

      return {
        templateId: savedTemplate.id,
        message: 'Template created successfully',
      };
    });
  }

  async findAll(): Promise<TemplateSummaryDto[]> {
    const templates = await this.workflowTemplateRepository.find({
      relations: ['checklistTemplates', 'checklistTemplates.items'],
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        name: true,
        transactionType: true,
        checklistTemplates: {
          name: true,
          items: {
            id: true,
          },
        },
      },
    });

    const transformedTemplates: TemplateSummaryDto[] = templates.map(
      (template) => ({
        id: template.id,
        name: template.name,
        transactionType: template.transactionType,
        checklistTemplates: template.checklistTemplates.map((checklist) => ({
          name: checklist.name,
          taskCount: checklist.items.length,
        })),
      }),
    );

    this.logger.log(
      `Successfully retrieved ${transformedTemplates.length} workflow templates`,
    );
    return transformedTemplates;
  }

  async findOne(id: string): Promise<WorkflowTemplate> {
    if (!id?.trim()) {
      throw new InvalidTemplateDataException('Template ID is required');
    }

    const template = await this.workflowTemplateRepository.findOne({
      where: { id },
      relations: ['checklistTemplates', 'checklistTemplates.items'],
      order: {
        checklistTemplates: {
          order: 'ASC',
          items: {
            order: 'ASC',
          },
        },
      },
    });

    if (!template) {
      throw new TemplateNotFoundException(id);
    }

    this.logger.log(
      `Successfully retrieved workflow template: ${template.name}`,
    );
    return template;
  }

  async update(
    id: string,
    updateDto: UpdateWorkflowTemplateDto,
  ): Promise<UpdateTemplateResponseDto> {
    if (!id?.trim()) {
      throw new InvalidTemplateDataException('Template ID is required');
    }

    return await this.dataSource.transaction(async (manager) => {
      // Check if template exists and load related data for differential update
      const existingTemplate = await manager.findOne(WorkflowTemplate, {
        where: { id },
        relations: ['checklistTemplates', 'checklistTemplates.items'],
      });

      if (!existingTemplate) {
        throw new TemplateNotFoundException(id);
      }

      // Update main template properties
      await manager.update(WorkflowTemplate, id, {
        name: updateDto.name,
        transactionType: updateDto.transactionType,
      });

      // Differential update for checklists and items
      await this.checklistTemplateService.updateChecklists(
        manager,
        id,
        existingTemplate.checklistTemplates,
        updateDto.checklistTemplates,
      );

      this.logger.log(
        `Successfully updated workflow template: ${updateDto.name} using differential update`,
      );

      return {
        templateId: id,
        message: 'Template updated successfully',
      };
    });
  }

  remove(id: string) {
    this.logger.log(`Removing template with ID: ${id}`);
    // TODO: Implement actual template removal logic
    return `This action removes a #${id} template`;
  }

  async cloneWorkflowTemplateToInstance(
    workflowTemplate: WorkflowTemplate,
  ): Promise<Workflow> {
    return await this.dataSource.transaction(async (manager) => {
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
      order: template.order,
    });

    const savedChecklist = await manager.save(newChecklist);

    // Clone all item templates
    for (const itemTemplate of template.items) {
      const newItem = manager.create(Item, {
        checklist: savedChecklist,
        description: itemTemplate.description,
        order: itemTemplate.order,
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

    const count = await this.workflowTemplateRepository.count({
      where: { transactionType },
    });
    return count > 0;
  }

  async getWorkflowTemplate(
    transactionType: TransactionType,
  ): Promise<WorkflowTemplate | null> {
    this.logger.log(
      `Retrieving workflow template for type: ${transactionType}`,
    );

    const template = await this.workflowTemplateRepository.findOne({
      where: { transactionType },
      relations: ['checklistTemplates', 'checklistTemplates.items'],
      order: {
        checklistTemplates: {
          order: 'ASC',
          items: {
            order: 'ASC',
          },
        },
      },
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
  }
}
