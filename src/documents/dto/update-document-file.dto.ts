import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDocumentFileDto {
  @ApiProperty({
    type: 'boolean',
    description:
      'Whether to mark the document as ready for signing after updating.',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isReadyForSigning?: boolean;
}
