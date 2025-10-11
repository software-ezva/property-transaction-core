import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Logger,
  HttpException,
  HttpStatus,
  BadRequestException,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { DocumentsService } from '../services/documents.service';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { DocumentResponseDto } from '../dto/document-response.dto';
import { DocumentListResponseDto } from '../dto/document-list-response.dto';
import { DocumentStatusResponseDto } from '../dto/document-status-response.dto';
import { Document } from '../entities/document.entity';
import { AuthenticatedRequest } from '../../common/interfaces';
import { UpdateDocumentFileDto } from '../dto/update-document-file.dto';
import { DocumentFile } from '../interfaces/document-file.interface';

@Controller('transactions')
@ApiTags('transactions')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(private readonly documentsService: DocumentsService) {}

  @Get(':transactionId/documents')
  @ApiOperation({
    summary: 'Get all documents for a transaction',
    description:
      'Retrieves all documents associated with a specific transaction. Returns document details including status, category, and metadata.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
    type: [DocumentListResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Transaction not found',
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
    description: 'Internal server error during documents retrieval',
  })
  async findAllDocuments(
    @Param('transactionId') transactionId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<DocumentListResponseDto[]> {
    try {
      const userAuth0Id = req.user.sub;
      const documents = await this.documentsService.findAllByTransactionId(
        transactionId,
        userAuth0Id,
      );

      const response: DocumentListResponseDto[] = documents.map((document) => ({
        documentId: document.documentId,
        title: document.title,
        category: document.category,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      }));

      this.logger.log(
        `Retrieved ${documents.length} documents for transaction ${transactionId} by user ${userAuth0Id}`,
      );
      return response;
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

  @Get(':transactionId/documents/:documentId')
  @ApiOperation({
    summary: 'Get a specific document by ID',
    description:
      'Retrieves a specific document from a transaction by its ID. Returns document details, a secure URL for accessing the file, and additional metadata including editability, signability, and signature request eligibility.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Document retrieved successfully',
    type: DocumentResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Transaction or document not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid transaction ID or document ID provided',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or invalid JWT token',
  })
  @ApiForbiddenResponse({
    description: 'User does not have access to this transaction',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during document retrieval',
  })
  async findOneDocument(
    @Param('transactionId') transactionId: string,
    @Param('documentId') documentId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<DocumentResponseDto> {
    try {
      const userAuth0Id = req.user.sub;
      const {
        document,
        secureUrl,
        isEditable,
        isSignable,
        couldBeRequestedForSignature,
      } = await this.documentsService.findOneByTransactionId(
        transactionId,
        documentId,
        userAuth0Id,
      );
      return {
        documentId: document.documentId,
        title: document.title,
        category: document.category,
        status: document.status,
        url: secureUrl,
        isEditable,
        isSignable,
        couldBeRequestedForSignature,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
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

  @Post(':transactionId/documents')
  @ApiOperation({
    summary: 'Create a new document for a transaction',
    description:
      'Creates a new document for a transaction based on a document template. The document template is duplicated and associated with the transaction.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: CreateDocumentDto,
    description:
      'Document creation data including template ID and optional customizations',
  })
  @ApiResponse({
    status: 201,
    description: 'Document created successfully',
    type: DocumentListResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Transaction or document template not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid transaction ID or document data provided',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or invalid JWT token',
  })
  @ApiForbiddenResponse({
    description: 'User does not have access to this transaction',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during document creation',
  })
  async createDocument(
    @Param('transactionId') transactionId: string,
    @Body() createDocumentDto: CreateDocumentDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<DocumentListResponseDto> {
    try {
      const userAuth0Id = req.user.sub;
      const document = await this.documentsService.addDocumentToTransaction(
        userAuth0Id,
        transactionId,
        createDocumentDto.documentTemplateId,
      );

      return {
        documentId: document.documentId,
        title: document.title,
        category: document.category,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
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

  @Patch(':transactionId/documents/:documentId/edit')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update document file',
    description:
      'Updates the file of a document. File uploads follow the same validation rules as document templates (PDF/Word, max 10MB). Optionally, the document can be marked as ready for signing by setting `isReady: true` in the request body, which will change its status to "Awaiting Signatures".',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiBody({
    description:
      'Document file update. The `isReady` field is optional and should be sent as a separate part in the multipart/form-data request to mark the document as ready for signing.',
    type: UpdateDocumentFileDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Document file updated successfully',
    type: DocumentResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Transaction or document not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid data provided or invalid file',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or invalid JWT token',
  })
  @ApiForbiddenResponse({
    description: 'User does not have access to this transaction',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during document file update',
  })
  async updateDocumentFile(
    @Param('transactionId') transactionId: string,
    @Param('documentId') documentId: string,
    @Body() updateDocumentFileDto: UpdateDocumentFileDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType:
              /(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/,
          }),
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
        fileIsRequired: true,
      }),
    )
    file: DocumentFile,
    @Request() req: AuthenticatedRequest,
  ): Promise<DocumentResponseDto> {
    try {
      const userAuth0Id = req.user.sub;
      const isReadyForSigning =
        updateDocumentFileDto.isReadyForSigning || false;

      const {
        document,
        secureUrl,
        isEditable,
        isSignable,
        couldBeRequestedForSignature,
      } = await this.documentsService.edit(
        transactionId,
        documentId,
        userAuth0Id,
        file,
        isReadyForSigning,
      );

      this.logger.log(
        `Document file ${documentId} updated successfully in transaction ${transactionId} by user ${userAuth0Id}`,
      );

      return {
        documentId: document.documentId,
        title: document.title,
        category: document.category,
        status: document.status,
        url: secureUrl,
        isEditable: isEditable,
        isSignable: isSignable,
        couldBeRequestedForSignature: couldBeRequestedForSignature,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during document file update',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':transactionId/documents/:documentId/check-for-edit')
  @ApiOperation({
    summary: 'Check document status and readiness for edit',
    description:
      'Verifies and returns the current status of a document, including whether it can be edited, signed, or requested for signature. This endpoint provides comprehensive document state information without generating the document URL.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description:
      'Document status information retrieved successfully (without file URL)',
    type: DocumentStatusResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid document ID, transaction ID, or user lacks permission to access this document',
  })
  async checkDocumentForEdit(
    @Param('transactionId') transactionId: string,
    @Param('documentId') documentId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<DocumentStatusResponseDto> {
    try {
      const userAuth0Id = req.user.sub;

      const { document, isEditable, isSignable, couldBeRequestedForSignature } =
        await this.documentsService.checkDocumentForEdit(
          userAuth0Id,
          documentId,
          transactionId,
        );

      this.logger.log(
        `Document ${documentId} marked as ready for signing in transaction ${transactionId} by user ${userAuth0Id}`,
      );

      return {
        documentId: document.documentId,
        title: document.title,
        category: document.category,
        status: document.status,
        isEditable: isEditable,
        isSignable: isSignable,
        couldBeRequestedForSignature: couldBeRequestedForSignature,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during document status update',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':transactionId/documents/:documentId/correct')
  @ApiOperation({
    summary: 'Correct a rejected document',
    description:
      'Corrects a document that was rejected. This transitions the document from "Rejected" state back to "In Edition" state so it can be edited again.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Document corrected successfully',
    type: DocumentListResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Document is not in rejected state',
  })
  @ApiForbiddenResponse({
    description: 'Only real estate agents can correct documents',
  })
  async correctDocument(
    @Param('transactionId') transactionId: string,
    @Param('documentId') documentId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<DocumentListResponseDto> {
    try {
      const userAuth0Id = req.user.sub;
      const document = await this.documentsService.correctDocument(
        userAuth0Id,
        transactionId,
        documentId,
      );

      this.logger.log(
        `Document ${documentId} corrected in transaction ${transactionId} by agent ${userAuth0Id}`,
      );

      return {
        documentId: document.documentId,
        title: document.title,
        category: document.category,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during document correction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':transactionId/documents/:documentId/sign')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Sign a document',
    description:
      'Signs a document that is awaiting signatures. The signed file replaces the original document file.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiBody({
    description: 'Signed document file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The signed document file (PDF or Word document)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Document signed successfully',
    type: DocumentListResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Document is not ready for signing or user cannot sign',
  })
  async signDocument(
    @Param('transactionId') transactionId: string,
    @Param('documentId') documentId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType:
              /(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/,
          }),
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
        fileIsRequired: true,
      }),
    )
    file: DocumentFile,
    @Request() req: AuthenticatedRequest,
  ): Promise<DocumentListResponseDto> {
    try {
      const userAuth0Id = req.user.sub;
      const document = await this.documentsService.signDocument(
        documentId,
        userAuth0Id,
        file,
      );

      this.logger.log(
        `Document ${documentId} signed in transaction ${transactionId} by user ${userAuth0Id}`,
      );

      return {
        documentId: document.documentId,
        title: document.title,
        category: document.category,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during document signing',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':transactionId/documents/:documentId/reject')
  @ApiOperation({
    summary: 'Reject a document',
    description:
      'Rejects a document that is awaiting signatures. The document transitions to "Rejected" state.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiBody({
    description: 'Rejection reason',
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Reason for rejecting the document',
          example: 'Missing required information in section 3',
        },
      },
      required: ['reason'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Document rejected successfully',
    type: DocumentListResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Document is not ready for signing or user cannot reject',
  })
  async rejectDocument(
    @Param('transactionId') transactionId: string,
    @Param('documentId') documentId: string,
    @Body() body: { reason: string },
    @Request() req: AuthenticatedRequest,
  ): Promise<DocumentListResponseDto> {
    try {
      const userAuth0Id = req.user.sub;
      const document = await this.documentsService.rejectDocument(
        documentId,
        userAuth0Id,
        body.reason,
      );

      this.logger.log(
        `Document ${documentId} rejected in transaction ${transactionId} by user ${userAuth0Id}. Reason: ${body.reason}`,
      );

      return {
        documentId: document.documentId,
        title: document.title,
        category: document.category,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during document rejection',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':transactionId/documents/:documentId/request-signature')
  @ApiOperation({
    summary: 'Request signature for a document',
    description:
      'Requests a signature from a specific user for a document that is awaiting signatures. Only real estate agents can request signatures.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiBody({
    description: 'Signature request data',
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID of the user to request signature from',
          example: '550e8400-e29b-41d4-a716-446655440002',
        },
        message: {
          type: 'string',
          description: 'Optional message for the signature request',
          example: 'Please review and sign this purchase agreement',
        },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Signature requested successfully',
    type: DocumentListResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Document is not ready for signatures',
  })
  @ApiForbiddenResponse({
    description: 'Only real estate agents can request signatures',
  })
  async requestSignature(
    @Param('transactionId') transactionId: string,
    @Param('documentId') documentId: string,
    @Body() signatureData: { userId: string; message?: string },
    @Request() req: AuthenticatedRequest,
  ): Promise<DocumentListResponseDto> {
    try {
      const agentAuth0Id = req.user.sub;
      const document = await this.documentsService.requestSign(
        agentAuth0Id,
        transactionId,
        documentId,
        signatureData,
      );

      this.logger.log(
        `Signature requested for document ${documentId} from user ${signatureData.userId} in transaction ${transactionId} by agent ${agentAuth0Id}`,
      );

      return {
        documentId: document.documentId,
        title: document.title,
        category: document.category,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during signature request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':transactionId/documents/:documentId/archive')
  @ApiOperation({
    summary: 'Archive a document',
    description:
      'Archives a document that is in "Signed" state. This transitions the document to "Archived" state. Only real estate agents can archive documents.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Document archived successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Document archived successfully',
        },
        documentId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Document is not in a state that can be archived',
  })
  @ApiForbiddenResponse({
    description: 'Only real estate agents can archive documents',
  })
  async archiveDocument(
    @Param('transactionId') transactionId: string,
    @Param('documentId') documentId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ message: string; documentId: string }> {
    try {
      const userAuth0Id = req.user.sub;
      await this.documentsService.archiveDocument(
        userAuth0Id,
        transactionId,
        documentId,
      );

      this.logger.log(
        `Document ${documentId} archived in transaction ${transactionId} by agent ${userAuth0Id}`,
      );

      return {
        message: 'Document archived successfully',
        documentId: documentId,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during document archiving',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
