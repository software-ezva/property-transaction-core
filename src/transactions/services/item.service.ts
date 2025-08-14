import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../entities/item.entity';
import { ItemStatus } from '../../common/enums';
import { Checklist } from '../entities/checklist.entity';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ItemNotFoundException } from '../expections';
import { TransactionAuthorizationService } from './transaction-authorization.service';

@Injectable()
export class ItemService {
  private readonly logger = new Logger(ItemService.name);

  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    private readonly transactionAuthorizationService: TransactionAuthorizationService,
  ) {}

  async addItemToChecklist(
    checklist: Checklist,
    description: string,
  ): Promise<Item> {
    const item = this.itemRepository.create({
      description: description,
      checklist: checklist,
      status: ItemStatus.NOT_STARTED,
    });
    const savedItem = await this.itemRepository.save(item);
    this.logger.log(
      `Item "${description}" added successfully to checklist ${checklist.id}`,
    );
    return savedItem;
  }

  async checkItemAs(item: Item, status: ItemStatus): Promise<Item> {
    item.status = status;
    const updatedItem = await this.itemRepository.save(item);
    this.logger.log(
      `Item ${item.id} status updated successfully to: ${status}`,
    );
    return updatedItem;
  }

  async updateItemInTransaction(
    transactionId: string,
    itemId: string,
    updateItemDto: UpdateItemDto,
    userAuth0Id: string,
  ): Promise<Item> {
    // First verify that the user has access to this transaction
    await this.transactionAuthorizationService.verifyUserCanAccessTransaction(
      transactionId,
      userAuth0Id,
    );

    // Find the item with its related transaction through checklist and workflow
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: [
        'checklist',
        'checklist.workflow',
        'checklist.workflow.transaction',
      ],
    });

    if (!item) {
      this.logger.warn(
        `Item with ID ${itemId} not found in transaction ${transactionId}`,
      );
      throw new ItemNotFoundException(itemId, transactionId);
    }

    // Verify the item belongs to the specified transaction
    if (
      !item.checklist?.workflow?.transaction ||
      item.checklist.workflow.transaction.transactionId !== transactionId
    ) {
      this.logger.warn(
        `Item ${itemId} does not belong to transaction ${transactionId}`,
      );
      throw new ItemNotFoundException(itemId, transactionId);
    }

    // Update the fields that are provided
    if (updateItemDto.status !== undefined) {
      item.status = updateItemDto.status;
    }

    if (updateItemDto.expectClosingDate !== undefined) {
      if (updateItemDto.expectClosingDate === null) {
        // Explicitly set to null to remove the date from database
        item.expectClosingDate = null;
      } else {
        // Set the new date (validation already done by DTO)
        item.expectClosingDate = new Date(updateItemDto.expectClosingDate);
      }
    }

    const updatedItem = await this.itemRepository.save(item);

    this.logger.log(
      `Item ${itemId} in transaction ${transactionId} updated successfully by user ${userAuth0Id}`,
    );
    return updatedItem;
  }
}
