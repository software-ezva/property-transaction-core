import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'The ID of the document template to use for this document',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID(4, { message: 'Document template ID must be a valid UUID' })
  documentTemplateId: string;
}
