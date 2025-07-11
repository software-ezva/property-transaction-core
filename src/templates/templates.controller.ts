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
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

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
  })
  @ApiBadRequestResponse({
    description: 'Invalid template data provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during template creation',
  })
  create(@Body() createTemplateDto: CreateTemplateDto) {
    try {
      const result = this.templatesService.create(createTemplateDto);
      return result;
    } catch (error) {
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
    summary: 'Get all templates',
    description: 'Retrieves a list of all workflow templates in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Templates retrieved successfully',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during templates retrieval',
  })
  findAll() {
    try {
      const result = this.templatesService.findAll();
      return result;
    } catch (error) {
      this.logger.error(
        'Failed to retrieve templates',
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
    summary: 'Get template by ID',
    description: 'Retrieves a specific workflow template by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID',
    type: 'string',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 200,
    description: 'Template retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Template not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid template ID provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during template retrieval',
  })
  findOne(@Param('id') id: string) {
    try {
      const result = this.templatesService.findOne(id);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve template with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during template retrieval',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update template by ID',
    description:
      'Updates a specific workflow template with the provided configuration.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID',
    type: 'string',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiBody({
    type: UpdateTemplateDto,
    description: 'Template configuration to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Template updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Template not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid template ID or data provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during template update',
  })
  update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    try {
      const result = this.templatesService.update(id, updateTemplateDto);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to update template with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      if (error instanceof HttpException) {
        throw error;
      }
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
  remove(@Param('id') id: string) {
    try {
      const result = this.templatesService.remove(id);
      this.logger.log(`Template deleted: ${id}`); // Solo para operaciones críticas como DELETE
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to delete template with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during template deletion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
