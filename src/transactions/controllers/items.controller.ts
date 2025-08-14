import {
  Controller,
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
import { UpdateItemResponseDto } from '../dto/update-item-response.dto';
import {
  ItemNotFoundException,
  UnauthorizedTransactionAccessException,
} from '../expections';
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
