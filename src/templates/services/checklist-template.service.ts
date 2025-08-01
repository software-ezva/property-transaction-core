import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ChecklistTemplate } from '../entities/checklist-template.entity';
import { UpdateChecklistTemplateDto } from '../dto/update-workflow-template-complete.dto';
import { CreateChecklistTemplateDto } from '../dto/create-template.dto';
import { ItemTemplateService } from './item-template.service';

@Injectable()
export class ChecklistTemplateService {
  private readonly logger = new Logger(ChecklistTemplateService.name);

  constructor(private readonly itemTemplateService: ItemTemplateService) {}

  /**
   * Updates checklists for a template using differential approach
   * - Updates existing checklists and their items
   * - Creates new checklists with items
   * - Deletes orphaned checklists (cascade deletes items)
   */
  async updateChecklists(
    manager: EntityManager,
    templateId: string,
    existingChecklists: ChecklistTemplate[],
    newChecklists: UpdateChecklistTemplateDto[],
  ): Promise<void> {
    const existingIds = new Set(
      existingChecklists.map((checklist) => checklist.id),
    );
    const newIds = new Set(
      newChecklists
        .filter((checklist) => checklist.id)
        .map((checklist) => checklist.id!),
    );

    // Delete orphaned checklists (exist in DB but not in payload)
    const toDelete = [...existingIds].filter((id) => !newIds.has(id));
    if (toDelete.length > 0) {
      await manager.delete(ChecklistTemplate, toDelete);
    }

    // Process each checklist from the payload
    for (const checklistDto of newChecklists) {
      if (checklistDto.id && existingIds.has(checklistDto.id)) {
        // UPDATE existing checklist
        await manager.update(ChecklistTemplate, checklistDto.id, {
          name: checklistDto.name,
          description: checklistDto.description,
          order: checklistDto.order,
        });

        // Update items for this checklist
        const existingChecklist = existingChecklists.find(
          (c) => c.id === checklistDto.id,
        )!;
        await this.itemTemplateService.updateItems(
          manager,
          checklistDto.id,
          existingChecklist.items,
          checklistDto.items,
        );
      } else {
        // CREATE new checklist
        const checklist = manager.create(ChecklistTemplate, {
          workflowTemplate: { id: templateId },
          name: checklistDto.name,
          description: checklistDto.description,
          order: checklistDto.order,
        });
        const savedChecklist = await manager.save(checklist);

        // Create all items for the new checklist
        await this.itemTemplateService.createItemsForChecklist(
          manager,
          savedChecklist.id,
          checklistDto.items,
        );
      }
    }
  }

  /**
   * Creates all checklists with items for a new template
   */
  async createChecklistsForTemplate(
    manager: EntityManager,
    templateId: string,
    checklists: UpdateChecklistTemplateDto[],
  ): Promise<void> {
    for (const checklistDto of checklists) {
      const checklist = manager.create(ChecklistTemplate, {
        workflowTemplate: { id: templateId },
        name: checklistDto.name,
        description: checklistDto.description,
        order: checklistDto.order,
      });
      const savedChecklist = await manager.save(checklist);

      await this.itemTemplateService.createItemsForChecklist(
        manager,
        savedChecklist.id,
        checklistDto.items,
      );
    }

    this.logger.debug(
      `Created ${checklists.length} checklists for new template ${templateId}`,
    );
  }

  /**
   * Creates checklists with items for a new template (for template creation)
   */
  async createChecklists(
    manager: EntityManager,
    templateId: string,
    checklistsDto: CreateChecklistTemplateDto[],
  ): Promise<void> {
    for (const checklistDto of checklistsDto) {
      // Create checklist
      const checklist = manager.create(ChecklistTemplate, {
        workflowTemplate: { id: templateId },
        name: checklistDto.name,
        description: checklistDto.description,
        order: checklistDto.order,
      });

      const savedChecklist = await manager.save(checklist);

      // Create items for this checklist
      await this.itemTemplateService.createItems(
        manager,
        savedChecklist.id,
        checklistDto.items,
      );
    }

    this.logger.debug(
      `Created ${checklistsDto.length} checklists for new template ${templateId}`,
    );
  }
}
