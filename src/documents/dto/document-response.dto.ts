import { ApiProperty } from '@nestjs/swagger';
import { DocumentCategory, DocumentStatus } from '../../common/enums';

export class DocumentResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the document',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  documentId: string;

  @ApiProperty({
    description: 'Title of the document',
    example: 'Purchase Agreement - 123 Main St',
  })
  title: string;

  @ApiProperty({
    description: 'Category of the document',
    enum: DocumentCategory,
    example: DocumentCategory.CONTRACT_AND_NEGOTIATION,
  })
  category: DocumentCategory;

  @ApiProperty({
    description: 'Current status of the document',
    enum: DocumentStatus,
    example: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @ApiProperty({
    description: 'Temporary secure URL for accessing the document file',
    example:
      'https://firebasestorage.googleapis.com/v0/b/project.appspot.com/o/documents%2Fdoc.pdf?alt=media&token=xyz',
  })
  url: string;

  @ApiProperty({
    description: 'Date when the document was created',
    example: '2024-08-29T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the document was last updated',
    example: '2024-08-29T10:30:00Z',
  })
  updatedAt: Date;
}
