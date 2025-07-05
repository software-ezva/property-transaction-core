import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsNumber, IsOptional } from 'class-validator';

export class CreateChecklistTemplateDto {
  @ApiProperty({
    description: 'Name of the checklist template',
    example: 'Legal Review',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Description of the checklist template',
    example: 'Review all legal documents and ownership',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Order position for this checklist in the workflow',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({
    description: 'ID of the workflow template this checklist belongs to',
    example: 1,
  })
  @IsNumber()
  workflowTemplateId: number;
}
