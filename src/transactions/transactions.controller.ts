import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Logger,
  HttpException,
  HttpStatus,
  Request,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { TransactionsService } from './services/transactions.service';
import { TemplatesService } from '../templates/services/templates.service';
import { UsersService } from '../users/users.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionSummaryDto } from './dto/transaction-summary.dto';
import { TransactionDetailDto } from './dto/transaction-detail.dto';
import { TransactionWithSummaryInfo } from './interfaces/transaction-with-summary-info.interface';
import { TransactionWithDetailedInfo } from './interfaces/transaction-with-detailed-info.interface';
import { AuthenticatedRequest } from '../common/interfaces';
import {
  InvalidTransactionDataException,
  DuplicateTransactionException,
  PropertyNotFoundException,
  UserNotFoundException,
  TransactionNotFoundException,
} from '../common/exceptions';
import { CreateTransactionResponseDto } from './dto/create-transaction-response.dto';

@Controller('transactions')
@ApiTags('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly templatesService: TemplatesService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new transaction',
    description:
      'Creates a new property transaction with the provided details and optional additional notes. The agent is automatically determined from the authenticated user (JWT token). Assigns a workflow template based on the transaction type.',
  })
  @ApiBody({
    type: CreateTransactionDto,
    description:
      'Transaction information including property ID, optional client ID, transaction type, and optional notes. The agent is automatically extracted from the authentication token.',
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully with workflow assigned',
    schema: {
      type: 'object',
      properties: {
        transactionId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        message: {
          type: 'string',
          example: 'Transaction created successfully',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Invalid transaction data, transaction type, or validation errors',
  })
  @ApiNotFoundResponse({
    description: 'Property not found or agent not registered in the system',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or invalid JWT token',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during transaction creation',
  })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<CreateTransactionResponseDto> {
    try {
      // Extract agent from JWT token
      const auth0User = req.user.sub;
      // Create the transaction using the service
      const transaction = await this.transactionsService.create(
        createTransactionDto,
        auth0User,
      );
      // Return the transaction ID
      return {
        transactionId: transaction.transactionId,
        message: 'Transaction created successfully',
      };
    } catch (error) {
      this.logger.error(
        'Failed to create transaction',
        error instanceof Error ? error.stack : String(error),
      );

      // Handle domain exceptions
      if (error instanceof InvalidTransactionDataException) {
        throw new BadRequestException(error.message);
      }

      if (error instanceof DuplicateTransactionException) {
        throw new BadRequestException(error.message);
      }

      if (error instanceof PropertyNotFoundException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof UserNotFoundException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof TransactionNotFoundException) {
        throw new NotFoundException(error.message);
      }

      // Handle NestJS exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof HttpException
      ) {
        throw error;
      }

      // Handle unexpected errors
      throw new HttpException(
        'Internal server error during transaction creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all transactions',
    description:
      'Retrieves a list of all transactions in the system with summary information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: TransactionSummaryDto,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during transactions retrieval',
  })
  async findAll(
    @Request() req: AuthenticatedRequest,
  ): Promise<TransactionSummaryDto[]> {
    try {
      // Extract agent from JWT token
      const auth0User = req.user.sub;
      // Create the transaction using the service
      const results: TransactionWithSummaryInfo[] =
        await this.transactionsService.findAll(auth0User);
      return results.map((result) => ({
        transactionId: result.transaction?.transactionId ?? null,
        transactionType: result.transaction?.transactionType ?? null,
        status: result.transaction?.status ?? null,
        additionalNotes: result.transaction?.additionalNotes || null,
        createdAt: result.transaction?.createdAt ?? null,
        updatedAt: result.transaction?.updatedAt ?? null,
        propertyAddress: result.propertyAddress ?? null,
        propertyValue: result.propertyValue ?? null,
        clientName: result.clientName ?? null,
        totalWorkflowItems: result.totalWorkflowItems ?? 0,
        completedWorkflowItems: result.completedWorkflowItems ?? 0,
        nextIncompleteItemDate: result.nextIncompleteItemDate ?? null,
      }));
    } catch (error) {
      this.logger.error(
        'Failed to retrieve transactions',
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        'Internal server error during transactions retrieval',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get transaction by ID',
    description: 'Retrieves a specific transaction by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
    type: TransactionDetailDto,
  })
  @ApiNotFoundResponse({
    description: 'Transaction not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid transaction ID provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during transaction retrieval',
  })
  async findOne(@Param('id') id: string): Promise<TransactionDetailDto> {
    try {
      if (!id || !id.trim()) {
        throw new HttpException(
          'Invalid transaction ID',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result: TransactionWithDetailedInfo =
        await this.transactionsService.findOneWithDetails(id);
      this.logger.log(`Transaction with ID ${id} retrieved successfully`);

      return {
        transactionId: result.transaction?.transactionId ?? null,
        transactionType: result.transaction?.transactionType ?? null,
        status: result.transaction?.status ?? null,
        additionalNotes: result.transaction?.additionalNotes || null,
        createdAt: result.transaction?.createdAt ?? null,
        updatedAt: result.transaction?.updatedAt ?? null,
        totalWorkflowItems: result.totalWorkflowItems ?? 0,
        completedWorkflowItems: result.completedWorkflowItems ?? 0,
        nextIncompleteItemDate: result.nextIncompleteItemDate ?? null,
        propertyAddress: result.propertyAddress ?? null,
        propertyPrice: result.propertyPrice ?? null,
        propertySize: result.propertySize ?? null,
        propertyBedrooms: result.propertyBedrooms ?? null,
        propertyBathrooms: result.propertyBathrooms ?? null,
        clientName: result.clientName ?? null,
        clientEmail: result.clientEmail ?? null,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve transaction with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during transaction retrieval',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update transaction by ID',
    description:
      'Updates a specific transaction with the provided information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    type: 'string',
  })
  @ApiBody({
    type: UpdateTransactionDto,
    description: 'Transaction information to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Transaction not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid transaction ID or data provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during transaction update',
  })
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    this.logger.log(`Updating transaction with ID: ${id}`);

    try {
      if (!id || !id.trim()) {
        throw new HttpException(
          'Invalid transaction ID',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = this.transactionsService.update(id, updateTransactionDto);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to update transaction with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during transaction update',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete transaction by ID',
    description: 'Deletes a specific transaction from the system.',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Transaction 123 and all related data deleted successfully',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Transaction not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid transaction ID provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during transaction deletion',
  })
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting transaction with ID: ${id}`);

    try {
      if (!id || !id.trim()) {
        throw new HttpException(
          'Invalid transaction ID',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.transactionsService.remove(id);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to delete transaction with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during transaction deletion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
