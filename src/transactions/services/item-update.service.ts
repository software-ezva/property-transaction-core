import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemUpdate } from '../entities/item-update.entity';
import { CreateItemUpdateDto } from '../dto/create-item-update.dto';
import { TransactionAuthorizationService } from './transaction-authorization.service';
import {
  ItemUpdateNotFoundException,
  UnauthorizedItemUpdateDeletionException,
} from '../exceptions';
import { ItemService } from './item.service';
@Injectable()
export class ItemUpdateService {
  private readonly logger = new Logger(ItemUpdateService.name);

  constructor(
    @InjectRepository(ItemUpdate)
    private readonly itemUpdateRepository: Repository<ItemUpdate>,
    private readonly transactionAuthorizationService: TransactionAuthorizationService,
    private readonly itemService: ItemService,
  ) {}

  async createItemUpdate(
    itemId: string,
    userAuth0Id: string,
    createItemUpdateDto: CreateItemUpdateDto,
  ): Promise<ItemUpdate> {
    const item = await this.itemService.getItemById(itemId);

    // Verify access
    await this.transactionAuthorizationService.verifyUserCanAccessTransaction(
      item.checklist.workflow.transaction.transactionId,
      userAuth0Id,
    );

    const update = this.itemUpdateRepository.create({
      content: createItemUpdateDto.content,
      item: item,
      createdBy: userAuth0Id,
      createdByName: createItemUpdateDto.userName,
    });

    const savedUpdate = await this.itemUpdateRepository.save(update);
    this.logger.log(
      `Item update created for item ${itemId} by user ${userAuth0Id}`,
    );
    return savedUpdate;
  }

  async deleteItemUpdate(updateId: string, userAuth0Id: string): Promise<void> {
    const update = await this.getItemUpdateById(updateId);

    // Verify access
    await this.transactionAuthorizationService.verifyUserCanAccessTransaction(
      update.item.checklist.workflow.transaction.transactionId,
      userAuth0Id,
    );

    // Check ownership
    if (update.createdBy !== userAuth0Id) {
      throw new UnauthorizedItemUpdateDeletionException();
    }

    await this.itemUpdateRepository.remove(update);
    this.logger.log(`Item update ${updateId} deleted by user ${userAuth0Id}`);
  }

  async getItemUpdateById(updateId: string): Promise<ItemUpdate> {
    const update = await this.itemUpdateRepository.findOne({
      where: { id: updateId },
      relations: [
        'item',
        'item.checklist',
        'item.checklist.workflow',
        'item.checklist.workflow.transaction',
      ],
    });

    if (!update) {
      throw new ItemUpdateNotFoundException(updateId);
    }
    return update;
  }
}
