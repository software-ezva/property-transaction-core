import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  Request,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ItemUpdateService } from '../services/item-update.service';
import { CreateItemUpdateDto } from '../dto/create-item-update.dto';
import { ItemUpdateResponseDto } from '../dto/item-update-response.dto';
import { AuthenticatedRequest } from '../../common/interfaces';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
export class ItemUpdatesController {
  private readonly logger = new Logger(ItemUpdatesController.name);

  constructor(private readonly itemUpdateService: ItemUpdateService) {}

  @Post('items/:itemId/updates')
  @ApiOperation({ summary: 'Add an update/comment to an item' })
  @ApiParam({ name: 'itemId', description: 'The ID of the item' })
  @ApiBody({ type: CreateItemUpdateDto })
  @ApiResponse({
    status: 201,
    description: 'The update has been successfully created.',
    type: ItemUpdateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createItemUpdate(
    @Param('itemId') itemId: string,
    @Body() createItemUpdateDto: CreateItemUpdateDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ItemUpdateResponseDto> {
    try {
      return await this.itemUpdateService.createItemUpdate(
        itemId,
        req.user.sub,
        createItemUpdateDto,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create item update for item ${itemId}`,
        error instanceof Error ? error.stack : String(error),
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal server error during item update creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('items/updates/:updateId')
  @ApiOperation({ summary: 'Delete an item update' })
  @ApiParam({ name: 'updateId', description: 'The ID of the update to delete' })
  @ApiResponse({
    status: 200,
    description: 'The update has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Update not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async deleteItemUpdate(
    @Param('updateId') updateId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    try {
      const userAuth0Id = req.user.sub;
      await this.itemUpdateService.deleteItemUpdate(updateId, userAuth0Id);
    } catch (error) {
      this.logger.error(
        `Failed to delete item update ${updateId}`,
        error instanceof Error ? error.stack : String(error),
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal server error during item update deletion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
