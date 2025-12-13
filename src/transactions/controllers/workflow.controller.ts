import {
  Controller,
  Get,
  Param,
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
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { WorkflowService } from '../services/workflow.service';
import { WorkflowResponseDto } from '../dto/workflow-response.dto';
import {
  TransactionNotFoundException,
  UnauthorizedTransactionAccessException,
} from '../exceptions';
import { AuthenticatedRequest } from '../../common/interfaces';

@Controller('transactions')
@ApiTags('transactions')
export class WorkflowController {
  private readonly logger = new Logger(WorkflowController.name);

  constructor(private readonly workflowService: WorkflowService) {}

  @Get(':id/workflow')
  @ApiOperation({
    summary: 'Get workflow for a transaction',
    description:
      'Retrieves the complete workflow information for a specific transaction, including all checklists and items with their current status and progress.',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Workflow retrieved successfully',
    type: WorkflowResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Transaction not found or no workflow assigned',
  })
  @ApiBadRequestResponse({
    description: 'Invalid transaction ID provided',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or invalid JWT token',
  })
  @ApiForbiddenResponse({
    description: 'User does not have access to this transaction',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during workflow retrieval',
  })
  async getWorkflow(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<WorkflowResponseDto> {
    try {
      // Extract user from JWT token
      const userAuth0Id = req.user.sub;
      const workflow = await this.workflowService.getWorkflowByTransactionId(
        id,
        userAuth0Id,
      );
      return workflow;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve workflow for transaction ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      // Handle domain exceptions
      if (error instanceof TransactionNotFoundException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof UnauthorizedTransactionAccessException) {
        throw new ForbiddenException(error.message);
      }

      // Handle NestJS exceptions
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Handle workflow not found
      if (
        error instanceof Error &&
        error.message.includes('No workflow found')
      ) {
        throw new NotFoundException(`No workflow found for transaction ${id}`);
      }

      // Handle unexpected errors
      throw new HttpException(
        'Internal server error during workflow retrieval',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
