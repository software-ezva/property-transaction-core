import { ApiProperty } from '@nestjs/swagger';
import { ItemStatus } from '../../common/enums';

export class ExpiringItemResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the item',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Unique identifier of the transaction',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Description of the item',
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
    description: 'Date when the item was created',
    example: '2023-10-27T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the item was last updated',
    example: '2023-10-28T10:00:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Expected closing date for the item',
    example: '2024-01-20',
    nullable: true,
  })
  expectClosingDate?: Date | null;
}
