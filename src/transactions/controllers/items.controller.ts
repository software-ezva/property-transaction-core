import {
  Controller,
  Get,
  Post,
  Query,
  Patch,
  Param,
  Body,
  Logger,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ItemService } from '../services/item.service';
import { UpdateItemDto } from '../dto/update-item.dto';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemResponseDto } from '../dto/update-item-response.dto';
import { GetExpiringItemsDto } from '../dto/get-expiring-items.dto';
import { WorkflowItemDto } from '../dto/workflow-response.dto';
import { ExpiringItemResponseDto } from '../dto/expiring-item-response.dto';
import {
  ItemNotFoundException,
  UnauthorizedTransactionAccessException,
} from '../exceptions';
import {
  InvalidDateFormatException,
  PastDateNotAllowedException,
  InvalidDateValueException,
} from '../../common/exceptions';
import { AuthenticatedRequest } from '../../common/interfaces';

@Controller('transactions')
@ApiTags('transactions')
export class ItemsController {
  private readonly logger = new Logger(ItemsController.name);

  constructor(private readonly itemService: ItemService) {}

  @Get('items/expiring')
  @ApiOperation({
    summary: 'Get expiring items',
    description:
      'Retrieves a list of items that are expected to close within the specified number of days (default 7) for the authenticated agent.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of expiring items retrieved successfully',
    type: [ExpiringItemResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or invalid JWT token',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during retrieval',
  })
  async getExpiringItems(
    @Query() query: GetExpiringItemsDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ExpiringItemResponseDto[]> {
    try {
      const userAuth0Id = req.user.sub;
      const items = await this.itemService.getExpiringItems(
        userAuth0Id,
        query.days ?? 7,
      );

      return items.map((item) => ({
        id: item.id,
        transactionId: item.checklist?.workflow?.transaction?.transactionId,
        description: item.description,
        order: item.order,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        expectClosingDate: item.expectClosingDate,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get expiring items for user ${req.user.sub}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        'Internal server error during retrieval',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post(':transactionId/workflow/checklists/:checklistId/items')
  @ApiOperation({ summary: 'Add an item to a checklist' })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    type: 'string',
  })
  @ApiParam({
    name: 'checklistId',
    description: 'Checklist ID',
    type: 'string',
  })
  @ApiBody({ type: CreateItemDto })
  @ApiResponse({
    status: 201,
    description: 'Item added successfully',
    type: WorkflowItemDto,
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'User does not belong to transaction' })
  @ApiNotFoundResponse({ description: 'Transaction or checklist not found' })
  async addItem(
    @Param('transactionId') transactionId: string,
    @Param('checklistId') checklistId: string,
    @Body() createItemDto: CreateItemDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.itemService.createItem(
      transactionId,
      checklistId,
      createItemDto,
      req.user.sub,
    );
  }

  @Patch(':transactionId/workflow/items/:itemId')
  @ApiOperation({
    summary: 'Update workflow item',
    description:
      'Updates a specific workflow item within a transaction. Can update status, expected closing date, or both.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'itemId',
    description: 'Item ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiBody({
    type: UpdateItemDto,
    description:
      'Item information to update. Can include status, expectClosingDate, or both. Date cannot be in the past.',
    examples: {
      statusOnly: {
        summary: 'Update status only',
        value: { status: 'completed' },
      },
      dateOnly: {
        summary: 'Update date only (must be today or future)',
        value: { expectClosingDate: '2025-02-15' },
      },
      both: {
        summary: 'Update both status and date',
        value: { status: 'in_progress', expectClosingDate: '2025-02-20' },
      },
      removeDate: {
        summary: 'Remove expected closing date',
        value: { expectClosingDate: null },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Item updated successfully',
    type: UpdateItemResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Transaction or item not found',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid transaction ID, item ID, data provided, or date in the past',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or invalid JWT token',
  })
  @ApiForbiddenResponse({
    description: 'User does not have access to this transaction',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during item update',
  })
  async updateItem(
    @Param('transactionId') transactionId: string,
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdateItemDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<UpdateItemResponseDto> {
    try {
      // Extract user from JWT token
      const userAuth0Id = req.user.sub;
      const updatedItem = await this.itemService.updateItemInTransaction(
        transactionId,
        itemId,
        updateItemDto,
        userAuth0Id,
      );

      return {
        id: updatedItem.id,
        message: 'Item updated successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to update item ${itemId} in transaction ${transactionId}`,
        error instanceof Error ? error.stack : String(error),
      );

      // Handle domain exceptions
      if (error instanceof ItemNotFoundException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof UnauthorizedTransactionAccessException) {
        throw new ForbiddenException(error.message);
      }

      // Handle date validation exceptions
      if (
        error instanceof InvalidDateFormatException ||
        error instanceof PastDateNotAllowedException ||
        error instanceof InvalidDateValueException
      ) {
        throw new BadRequestException(error.message);
      }

      // Handle NestJS exceptions
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Handle unexpected errors
      throw new HttpException(
        'Internal server error during item update',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
