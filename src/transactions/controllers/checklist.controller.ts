import { Controller, Post, Body, Param, Logger, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ChecklistService } from '../services/checklist.service';
import { CreateChecklistDto } from '../dto/create-checklist.dto';
import { WorkflowChecklistDto } from '../dto/workflow-response.dto';
import { AuthenticatedRequest } from '../../common/interfaces';

@Controller('transactions')
@ApiTags('transactions')
export class ChecklistController {
  private readonly logger = new Logger(ChecklistController.name);

  constructor(private readonly checklistService: ChecklistService) {}

  @Post(':transactionId/workflow/checklists')
  @ApiOperation({ summary: 'Add a checklist to the transaction workflow' })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    type: 'string',
  })
  @ApiBody({ type: CreateChecklistDto })
  @ApiResponse({
    status: 201,
    description: 'Checklist added successfully',
    type: WorkflowChecklistDto,
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'User does not belong to transaction' })
  @ApiNotFoundResponse({ description: 'Transaction or workflow not found' })
  async addChecklist(
    @Param('transactionId') transactionId: string,
    @Body() createChecklistDto: CreateChecklistDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.checklistService.createChecklist(
      transactionId,
      createChecklistDto,
      req.user.sub,
    );
  }
}
