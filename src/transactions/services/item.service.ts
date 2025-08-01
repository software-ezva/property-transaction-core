import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item, ItemStatus } from '../entities/item.entity';
import { Checklist } from '../entities/checklist.entity';

@Injectable()
export class ItemService {
  private readonly logger = new Logger(ItemService.name);

  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
  ) {}

  async addItemToChecklist(
    checklist: Checklist,
    description: string,
  ): Promise<{ item: Item | null; saved: boolean }> {
    try {
      const item = this.itemRepository.create({
        description: description,
        checklist: checklist,
        status: ItemStatus.NOT_STARTED,
      });

      const savedItem = await this.itemRepository.save(item);
      this.logger.log(
        `Item "${description}" added successfully to checklist ${checklist.id}`,
      );
      return { item: savedItem, saved: true };
    } catch (error) {
      this.logger.error(
        `Failed to add item "${description}" to checklist ${checklist.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      return { item: null, saved: false };
    }
  }

  async checkItemAs(item: Item, state: ItemStatus): Promise<boolean> {
    try {
      const statusMap: Record<string, ItemStatus> = {
        pending: ItemStatus.NOT_STARTED,
        'in progress': ItemStatus.IN_PROGRESS,
        completed: ItemStatus.COMPLETED,
      };

      const newStatus = statusMap[state.toLowerCase()];
      if (!newStatus) {
        this.logger.warn(`Invalid status provided: ${state}`);
        return false;
      }

      item.status = newStatus;
      await this.itemRepository.save(item);
      this.logger.log(
        `Item ${item.id} status updated successfully to: ${newStatus}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to update item ${item.id} status to: ${state}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}
