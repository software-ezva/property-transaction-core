import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../entities/item.entity';
import { ItemStatus } from '../../common/enums';
import { Checklist } from '../entities/checklist.entity';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ItemNotFoundException } from '../exceptions';
import { TransactionAuthorizationService } from './transaction-authorization.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { ChecklistService } from './checklist.service';
import { ChecklistNotFoundException } from '../exceptions/checklist-not-found.exception';

@Injectable()
export class ItemService {
  private readonly logger = new Logger(ItemService.name);

  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    private readonly transactionAuthorizationService: TransactionAuthorizationService,
    private readonly checklistService: ChecklistService,
  ) {}

  async createItem(
    transactionId: string,
    checklistId: string,
    createItemDto: CreateItemDto,
    userAuth0Id: string,
  ): Promise<Item> {
    // First verify that the user has access to this transaction
    await this.transactionAuthorizationService.verifyUserCanAccessTransaction(
      transactionId,
      userAuth0Id,
    );
    const checklist = await this.checklistService.getChecklistById(checklistId);

    // Verify checklist belongs to transaction
    if (checklist.workflow?.transaction?.transactionId !== transactionId) {
      throw new ChecklistNotFoundException(checklistId);
    }

    return this.addItemToChecklist(checklist, createItemDto.description);
  }

  async addItemToChecklist(
    checklist: Checklist,
    description: string,
  ): Promise<Item> {
    // Calculate the next order number
    const result = await this.itemRepository
      .createQueryBuilder('item')
      .select('MAX(item.order)', 'max')
      .where('item.checklist = :checklistId', { checklistId: checklist.id })
      .getRawOne<{ max: string | null }>();

    const maxOrder =
      result && result.max !== null ? parseInt(result.max, 10) : 0;
    const newOrder = maxOrder + 1;

    const item = this.itemRepository.create({
      description: description,
      checklist: checklist,
      status: ItemStatus.NOT_STARTED,
      order: newOrder,
    });
    const savedItem = await this.itemRepository.save(item);
    this.logger.log(
      `Item "${description}" added successfully to checklist ${checklist.id} with order ${newOrder}`,
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

  async getExpiringItems(userAuth0Id: string, days: number): Promise<Item[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const items = await this.itemRepository
      .createQueryBuilder('item')
      .innerJoinAndSelect('item.checklist', 'checklist')
      .innerJoinAndSelect('checklist.workflow', 'workflow')
      .innerJoinAndSelect('workflow.transaction', 'transaction')
      .innerJoinAndSelect(
        'transaction.transactionCoordinatorAgent',
        'agentProfile',
      )
      .innerJoinAndSelect('agentProfile.user', 'agent')
      .where('agent.auth0Id = :auth0Id', { auth0Id: userAuth0Id })
      .andWhere('item.status != :status', { status: ItemStatus.COMPLETED })
      .andWhere('item.expectClosingDate IS NOT NULL')
      .andWhere('item.expectClosingDate BETWEEN :today AND :futureDate', {
        today: today.toISOString().split('T')[0],
        futureDate: futureDate.toISOString().split('T')[0],
      })
      .orderBy('item.expectClosingDate', 'ASC')
      .getMany();

    this.logger.log(
      `Found ${items.length} expiring items for agent ${userAuth0Id} in the next ${days} days`,
    );

    return items;
  }

  async getItemById(itemId: string): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: [
        'checklist',
        'checklist.workflow',
        'checklist.workflow.transaction',
      ],
    });

    if (!item) {
      throw new ItemNotFoundException(itemId);
    }
    return item;
  }
}
