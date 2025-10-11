import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { DocumentStatus } from '../../common/enums';

export class UpdateDocumentStatusDto {
  @ApiProperty({
    description: 'New status for the document',
    enum: DocumentStatus,
    example: DocumentStatus.IN_EDITION,
  })
  @IsEnum(DocumentStatus, {
    message: 'Status must be a valid DocumentStatus value',
  })
  @IsNotEmpty({ message: 'Status is required' })
  status: DocumentStatus;
}
