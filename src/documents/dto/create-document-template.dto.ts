import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { DocumentCategory } from '../../common/enums';

export class CreateDocumentTemplateDto {
  @ApiProperty({
    description: 'Title of the document template',
    example: 'Purchase Agreement Template',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
  title: string;

  @ApiProperty({
    description: 'Category of the document template',
    enum: DocumentCategory,
    example: DocumentCategory.CONTRACT_AND_NEGOTIATION,
  })
  @IsEnum(DocumentCategory, {
    message: 'Category must be a valid document category',
  })
  category: DocumentCategory;
}
