import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../common/enums';
import { ChecklistTemplateDto } from './checklist-detail.dto';

export class TemplateDetailDto {
  @ApiProperty({
    description: 'Unique identifier of the workflow template',
    format: 'uuid',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the workflow template',
    example: 'Property Sale Workflow',
  })
  name: string;

  @ApiProperty({
    description: 'Type of real estate transaction',
    enum: TransactionType,
    example: TransactionType.PURCHASE,
  })
  transactionType: TransactionType;

  @ApiProperty({
    description: 'Template creation timestamp',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Template last update timestamp',
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Complete checklist templates with all items',
    type: [ChecklistTemplateDto],
  })
  checklistTemplates: ChecklistTemplateDto[];
}
