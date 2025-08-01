import { ApiProperty } from '@nestjs/swagger';

export class ItemTemplateDto {
  @ApiProperty({
    description: 'Unique identifier of the item template',
    format: 'uuid',
    example: 'c2ggde77-9e2d-6gh0-dd8f-8dd1df502c33',
  })
  id: string;

  @ApiProperty({
    description: 'Description of the task/item',
    example: 'Property deed verification',
  })
  description: string;

  @ApiProperty({
    description: 'Order position for this item in the checklist',
    example: 1,
    minimum: 1,
  })
  order: number;

  @ApiProperty({
    description: 'Item creation timestamp',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Item last update timestamp',
    format: 'date-time',
  })
  updatedAt: Date;
}

export class ChecklistTemplateDto {
  @ApiProperty({
    description: 'Unique identifier of the checklist template',
    format: 'uuid',
    example: 'b1ffcd88-8d1c-5fg9-cc7e-7cc0ce491b22',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the checklist template',
    example: 'Documentation Checklist',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the checklist template',
    example: 'Collect all required documents for the transaction',
  })
  description: string;

  @ApiProperty({
    description: 'Order position for this checklist in the workflow',
    example: 1,
    minimum: 1,
  })
  order: number;

  @ApiProperty({
    description: 'Checklist creation timestamp',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Checklist last update timestamp',
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'List of items/tasks in this checklist',
    type: [ItemTemplateDto],
  })
  items: ItemTemplateDto[];
}
