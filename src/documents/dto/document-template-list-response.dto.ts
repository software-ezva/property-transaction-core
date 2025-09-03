import { ApiProperty } from '@nestjs/swagger';
import { DocumentCategory } from '../../common/enums';

export class DocumentTemplateListResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the document template',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  uuid: string;

  @ApiProperty({
    description: 'Title of the document template',
    example: 'Purchase Agreement Template',
  })
  title: string;

  @ApiProperty({
    description: 'Category of the document template',
    enum: DocumentCategory,
    example: DocumentCategory.CONTRACT_AND_NEGOTIATION,
  })
  category: DocumentCategory;

  @ApiProperty({
    description: 'Date when the template was created',
    example: '2024-08-29T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the template was last updated',
    example: '2024-08-29T10:30:00Z',
  })
  updatedAt: Date;
}
