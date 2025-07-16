import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionStatus } from '../../common/enums';

export class TransactionSummaryDto {
  @ApiProperty({
    description: 'The ID of the transaction',
    example: 'f453d33c-f0a1-41dd-9d4f-3b1961e0d6ea',
  })
  transactionId: string;

  @ApiProperty({
    description: 'The type of transaction',
    example: 'Lease',
  })
  transactionType: string;

  @ApiProperty({
    description: 'The status of the transaction',
    enum: TransactionStatus,
    example: TransactionStatus.ACTIVE,
  })
  status: TransactionStatus;

  @ApiPropertyOptional({
    description: 'Additional notes for the transaction',
    example: null,
  })
  additionalNotes: string | null;

  @ApiProperty({
    description: 'The date when the transaction was created',
    example: '2025-07-13T08:01:58.875Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the transaction was last updated',
    example: '2025-07-13T08:01:58.875Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'The address of the property',
    example: '123 Main St, New York, NY 10001',
  })
  propertyAddress: string;

  @ApiProperty({
    description: 'The value of the property',
    example: 500000,
  })
  propertyValue: number;

  @ApiPropertyOptional({
    description: 'The name of the client',
    example: 'John Doe',
  })
  clientName: string | null;

  @ApiProperty({
    description: 'Total number of items in the workflow',
    example: 15,
  })
  totalWorkflowItems: number;

  @ApiProperty({
    description: 'Number of completed items in the workflow',
    example: 8,
  })
  completedWorkflowItems: number;

  @ApiPropertyOptional({
    description: 'Date of the first incomplete item that is due',
    example: '2025-07-20T10:00:00.000Z',
  })
  nextIncompleteItemDate: Date | null;
}
