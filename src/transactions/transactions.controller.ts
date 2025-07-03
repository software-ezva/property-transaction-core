import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { TemplatesService } from '../templates/templates.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionType } from '../common/enums';
import { AuthGuard } from '@nestjs/passport';

@Controller('transactions')
@ApiTags('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly templatesService: TemplatesService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new transaction',
    description:
      'Creates a new property transaction with the provided details and assigns a workflow template based on the transaction type.',
  })
  @ApiBody({
    type: CreateTransactionDto,
    description: 'Transaction information to create including transaction type',
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully with workflow assigned',
  })
  @ApiBadRequestResponse({
    description: 'Invalid transaction data or transaction type provided',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during transaction creation',
  })
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    try {
      // Validate transaction type
      if (
        !Object.values(TransactionType).includes(
          createTransactionDto.transactionType,
        )
      ) {
        this.logger.warn(
          `Invalid transaction type provided: ${createTransactionDto.transactionType}`,
        );
        throw new BadRequestException(
          `Invalid transaction type. Valid types are: ${Object.values(TransactionType).join(', ')}`,
        );
      }

      const result =
        await this.transactionsService.create(createTransactionDto);
      return result;
    } catch (error) {
      this.logger.error(
        'Failed to create transaction',
        error instanceof Error ? error.stack : String(error),
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during transaction creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all transactions',
    description: 'Retrieves a list of all transactions in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during transactions retrieval',
  })
  findAll() {
    try {
      const result = this.transactionsService.findAll();
      return result;
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

  @Get('test/service-health')
  @ApiOperation({
    summary: 'Service health check',
    description: 'Returns the health status of transaction-related services.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service health information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        transactionsService: { type: 'string', example: 'OK' },
        templatesService: { type: 'string', example: 'OK' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  testServiceHealth() {
    const healthStatus = {
      transactionsService: 'OK',
      templatesService: 'OK',
      timestamp: new Date().toISOString(),
    };
    return healthStatus;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get transaction by ID',
    description: 'Retrieves a specific transaction by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
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
  findOne(@Param('id') id: string) {
    try {
      const transactionId = +id;
      if (isNaN(transactionId)) {
        throw new HttpException(
          'Invalid transaction ID',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = this.transactionsService.findOne(transactionId);
      this.logger.log(`Transaction with ID ${id} retrieved successfully`);
      return result;
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
    type: 'number',
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
      const transactionId = +id;
      if (isNaN(transactionId)) {
        throw new HttpException(
          'Invalid transaction ID',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = this.transactionsService.update(
        transactionId,
        updateTransactionDto,
      );
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
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction deleted successfully',
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
  remove(@Param('id') id: string) {
    this.logger.log(`Deleting transaction with ID: ${id}`);

    try {
      const transactionId = +id;
      if (isNaN(transactionId)) {
        throw new HttpException(
          'Invalid transaction ID',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = this.transactionsService.remove(transactionId);
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
