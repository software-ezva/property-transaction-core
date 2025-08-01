import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ItemTemplate } from '../entities/item-template.entity';
import { UpdateItemTemplateDto } from '../dto/update-workflow-template-complete.dto';
import { CreateItemTemplateDto } from '../dto/create-template.dto';

@Injectable()
export class ItemTemplateService {
  private readonly logger = new Logger(ItemTemplateService.name);

  async updateItems(
    manager: EntityManager,
    checklistId: string,
    existingItems: ItemTemplate[],
    newItems: UpdateItemTemplateDto[],
  ): Promise<void> {
    const existingIds = new Set(existingItems.map((item) => item.id));
    const newIds = new Set(
      newItems.filter((item) => item.id).map((item) => item.id!),
    );

    // Delete orphaned items (exist in DB but not in payload)
    const toDelete = [...existingIds].filter((id) => !newIds.has(id));
    if (toDelete.length > 0) {
      await manager.delete(ItemTemplate, toDelete);
      this.logger.debug(
        `Deleted ${toDelete.length} orphaned items from checklist ${checklistId}`,
      );
    }

    // Process each item from the payload
    for (const itemDto of newItems) {
      if (itemDto.id && existingIds.has(itemDto.id)) {
        // UPDATE existing item
        await manager.update(ItemTemplate, itemDto.id, {
          description: itemDto.description,
          order: itemDto.order,
        });
        this.logger.debug(`Updated item ${itemDto.id}`);
      } else {
        // CREATE new item
        const item = manager.create(ItemTemplate, {
          checklistTemplate: { id: checklistId },
          description: itemDto.description,
          order: itemDto.order,
        });
        await manager.save(item);
        this.logger.debug(`Created new item for checklist ${checklistId}`);
      }
    }
  }

  /**
   * Creates all items for a new checklist
   */
  async createItemsForChecklist(
    manager: EntityManager,
    checklistId: string,
    items: UpdateItemTemplateDto[],
  ): Promise<void> {
    for (const itemDto of items) {
      const item = manager.create(ItemTemplate, {
        checklistTemplate: { id: checklistId },
        description: itemDto.description,
        order: itemDto.order,
      });
      await manager.save(item);
    }

    this.logger.debug(
      `Created ${items.length} items for new checklist ${checklistId}`,
    );
  }

  /**
   * Creates items for a new checklist (for template creation)
   */
  async createItems(
    manager: EntityManager,
    checklistId: string,
    itemsDto: CreateItemTemplateDto[],
  ): Promise<void> {
    for (const itemDto of itemsDto) {
      const item = manager.create(ItemTemplate, {
        checklistTemplate: { id: checklistId },
        description: itemDto.description,
        order: itemDto.order,
      });
      await manager.save(item);
    }

    this.logger.debug(
      `Created ${itemsDto.length} items for new checklist ${checklistId}`,
    );
  }
}
