import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../common/enums';

export class ChecklistSummaryDto {
  @ApiProperty({
    description: 'Name of the checklist template',
    example: 'Documentation Checklist',
  })
  name: string;

  @ApiProperty({
    description: 'Number of tasks in this checklist',
    example: 5,
    minimum: 0,
  })
  taskCount: number;
}

export class TemplateSummaryDto {
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
    description: 'Summary of associated checklists',
    type: [ChecklistSummaryDto],
  })
  checklistTemplates: ChecklistSummaryDto[];
}
