import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Logger,
  Request,
  HttpException,
  HttpStatus,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { DocumentTemplatesService } from '../services/document-templates.service';
import { CreateDocumentTemplateDto } from '../dto/create-document-template.dto';
import { DocumentTemplateResponseDto } from '../dto/document-template-response.dto';
import { DocumentTemplateListResponseDto } from '../dto/document-template-list-response.dto';
import { AuthenticatedRequest } from '../../common/interfaces';

interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('document-templates')
@ApiTags('document-templates')
export class DocumentTemplatesController {
  private readonly logger = new Logger(DocumentTemplatesController.name);

  constructor(
    private readonly documentTemplatesService: DocumentTemplatesService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Create a new document template',
    description:
      'Creates a new document template by uploading a file (PDF or Word document) and providing template information.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document template data and file',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the document template',
          example: 'Purchase Agreement Template',
        },
        category: {
          type: 'string',
          enum: [
            'CONTRACT_AND_NEGOTIATION',
            'TITLE_AND_OWNERSHIP',
            'DISCLOSURE',
            'CLOSING_AND_FINANCING',
            'AGREEMENTS',
            'LISTINGS_AND_MARKETING',
            'PROPERTY_MANAGEMENT',
            'INSURANCE',
            'MISCELLANEOUS',
          ],
          description: 'Category of the document template',
          example: 'CONTRACT_AND_NEGOTIATION',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file (PDF or Word format)',
        },
      },
      required: ['title', 'category', 'file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document template created successfully',
    type: DocumentTemplateResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid file type, size, or missing required fields',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or user is not a real estate agent',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during document template creation',
  })
  async create(
    @Body() createDocumentTemplateDto: CreateDocumentTemplateDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType:
              /(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/,
          }),
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      }),
    )
    file: UploadedFile,
    @Request() req: AuthenticatedRequest,
  ): Promise<DocumentTemplateResponseDto> {
    try {
      // Extract user from JWT token
      const auth0UserId = req.user.sub;

      // Create the document template
      const { template: documentTemplate, secureUrl } =
        await this.documentTemplatesService.create(
          createDocumentTemplateDto,
          file,
          auth0UserId,
        );

      return {
        uuid: documentTemplate.uuid,
        title: documentTemplate.title,
        category: documentTemplate.category,
        url: secureUrl,
        createdAt: documentTemplate.createdAt,
        updatedAt: documentTemplate.updatedAt,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during document template creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all document templates',
    description:
      'Retrieves a list of all document templates. By default excludes archived templates.',
  })
  @ApiResponse({
    status: 200,
    description: 'Document templates retrieved successfully',
    type: DocumentTemplateListResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or user is not a real estate agent',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during document templates retrieval',
  })
  async findAll(
    @Request() req: AuthenticatedRequest,
  ): Promise<DocumentTemplateListResponseDto[]> {
    try {
      // Extract user from JWT token
      const auth0UserId = req.user.sub;

      // Get all document templates
      const documentTemplates =
        await this.documentTemplatesService.findAll(auth0UserId);

      // Return response DTOs without URL
      return documentTemplates.map((template) => ({
        uuid: template.uuid,
        title: template.title,
        category: template.category,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during document template creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get document template by ID',
    description:
      'Retrieves a specific document template by its UUID. Includes a temporary secure URL for accessing the document file.',
  })
  @ApiResponse({
    status: 200,
    description: 'Document template retrieved successfully',
    type: DocumentTemplateResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or user is not a real estate agent',
  })
  @ApiBadRequestResponse({
    description: 'Document template not found',
  })
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<DocumentTemplateResponseDto> {
    try {
      const auth0UserId = req.user.sub;

      // Get the document template
      const { template: documentTemplate, secureUrl } =
        await this.documentTemplatesService.findOne(id, auth0UserId);

      return {
        uuid: documentTemplate.uuid,
        title: documentTemplate.title,
        category: documentTemplate.category,
        url: secureUrl,
        createdAt: documentTemplate.createdAt,
        updatedAt: documentTemplate.updatedAt,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during document template creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a document template',
    description:
      'Permanently deletes a document template and its associated file from storage.',
  })
  @ApiResponse({
    status: 200,
    description: 'Document template deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Document template deleted successfully',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Document template not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or user is not a real estate agent',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during document template deletion',
  })
  async remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    try {
      const auth0UserId = req.user.sub;

      await this.documentTemplatesService.remove(id, auth0UserId);

      return {
        message: 'Document template deleted successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete document template ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal server error during document template deletion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
