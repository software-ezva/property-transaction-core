import { ApiProperty } from '@nestjs/swagger';
import { ItemStatus } from '../../common/enums';
import { ItemUpdateResponseDto } from './item-update-response.dto';

export class WorkflowItemDto {
  @ApiProperty({
    description: 'Unique identifier of the workflow item',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Description of the workflow item',
    example: 'Review property inspection report',
  })
  description: string;

  @ApiProperty({
    description: 'Order of the item in the checklist',
    example: 1,
  })
  order: number;

  @ApiProperty({
    description: 'Current status of the item',
    enum: ItemStatus,
    example: ItemStatus.IN_PROGRESS,
  })
  status: ItemStatus;

  @ApiProperty({
    description: 'Expected closing date for the item',
    type: Date,
    example: '2024-01-20T10:30:00Z',
    nullable: true,
  })
  expectClosingDate?: Date | null;

  @ApiProperty({
    description: 'List of updates/comments for this item',
    type: [ItemUpdateResponseDto],
  })
  updates?: ItemUpdateResponseDto[];
}

export class WorkflowChecklistDto {
  @ApiProperty({
    description: 'Unique identifier of the checklist',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the checklist',
    example: 'Property Inspection',
  })
  name: string;

  @ApiProperty({
    description: 'Order of the checklist in the workflow',
    example: 1,
  })
  order: number;

  @ApiProperty({
    description: 'Items in this checklist',
    type: [WorkflowItemDto],
  })
  items: WorkflowItemDto[];
}

export class WorkflowResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the workflow',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the workflow',
    example: 'Purchase Transaction Workflow',
  })
  name: string;

  @ApiProperty({
    description: 'Checklists in this workflow',
    type: [WorkflowChecklistDto],
  })
  checklists: WorkflowChecklistDto[];
}
