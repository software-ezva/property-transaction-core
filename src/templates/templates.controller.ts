import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { TemplatesService } from './services/templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateTemplateResponseDto } from './dto/create-template-response.dto';
import { UpdateWorkflowTemplateDto } from './dto/update-workflow-template-complete.dto';
import { UpdateTemplateResponseDto } from './dto/update-template-response.dto';
import { TemplateSummaryDto } from './dto/template-summary.dto';
import { TemplateDetailDto } from './dto/template-detail.dto';
import {
  TemplateNotFoundException,
  InvalidTemplateDataException,
  TemplateInUseException,
} from './exceptions';
import { UuidValidationPipe } from '../common/validators';

@Controller('templates')
@ApiTags('templates')
export class TemplatesController {
  private readonly logger = new Logger(TemplatesController.name);

  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new template',
    description:
      'Creates a new workflow template with the provided configuration.',
  })
  @ApiBody({
    type: CreateTemplateDto,
    description: 'Template configuration to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
    type: CreateTemplateResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid template data provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during template creation',
  })
  async create(
    @Body() createTemplateDto: CreateTemplateDto,
  ): Promise<CreateTemplateResponseDto> {
    try {
      return await this.templatesService.create(createTemplateDto);
    } catch (error) {
      if (error instanceof InvalidTemplateDataException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }

      this.logger.error(
        'Failed to create template',
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        'Internal server error during template creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all workflow templates',
    description:
      'Retrieves a list of all workflow templates in the system with summary information including checklist names and task counts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Workflow templates retrieved successfully',
    type: [TemplateSummaryDto],
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during templates retrieval',
  })
  async findAll(): Promise<TemplateSummaryDto[]> {
    try {
      return await this.templatesService.findAll();
    } catch (error) {
      this.logger.error(
        'Failed to retrieve workflow templates',
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        'Internal server error during templates retrieval',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get workflow template by ID',
    description:
      'Retrieves a specific workflow template by its ID with complete details including all checklists and their items.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the workflow template',
    type: 'string',
    format: 'uuid',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 200,
    description: 'Workflow template retrieved successfully',
    type: TemplateDetailDto,
  })
  @ApiNotFoundResponse({
    description: 'Workflow template not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid template ID provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during template retrieval',
  })
  async findOne(
    @Param('id', UuidValidationPipe) id: string,
  ): Promise<TemplateDetailDto> {
    try {
      return await this.templatesService.findOne(id);
    } catch (error) {
      if (error instanceof TemplateNotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error instanceof InvalidTemplateDataException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }

      this.logger.error(
        `Failed to retrieve template with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        'Internal server error during template retrieval',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update workflow template by ID',
    description:
      'Updates a complete workflow template including all checklists and items. Replaces the entire template structure.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the workflow template',
    type: 'string',
    format: 'uuid',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiBody({
    type: UpdateWorkflowTemplateDto,
    description:
      'Template configuration including checklists and items (ID not required in body)',
  })
  @ApiResponse({
    status: 200,
    description: 'Workflow template updated successfully',
    type: UpdateTemplateResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Workflow template not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid template ID or data provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during template update',
  })
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() updateTemplateDto: UpdateWorkflowTemplateDto,
  ): Promise<UpdateTemplateResponseDto> {
    try {
      return await this.templatesService.update(id, updateTemplateDto);
    } catch (error) {
      if (error instanceof TemplateNotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error instanceof InvalidTemplateDataException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }

      this.logger.error(
        `Failed to update template with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        'Internal server error during template update',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete template by ID',
    description: 'Deletes a specific workflow template from the system.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID',
    type: 'string',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 200,
    description: 'Template deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Template not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid template ID provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during template deletion',
  })
  remove(@Param('id', UuidValidationPipe) id: string) {
    try {
      return this.templatesService.remove(id);
    } catch (error) {
      if (error instanceof TemplateNotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error instanceof InvalidTemplateDataException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      if (error instanceof TemplateInUseException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }

      this.logger.error(
        `Failed to delete template with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        'Internal server error during template deletion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
