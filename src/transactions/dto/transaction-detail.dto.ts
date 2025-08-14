import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, TransactionStatus } from '../../common/enums';

export class TransactionDetailDto {
  @ApiProperty({
    description: 'Unique identifier of the transaction',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Type of the transaction',
    enum: TransactionType,
    example: TransactionType.PURCHASE,
  })
  transactionType: TransactionType;

  @ApiProperty({
    description: 'Current status of the transaction',
    enum: TransactionStatus,
    example: TransactionStatus.IN_PREPARATION,
  })
  status: TransactionStatus;

  @ApiProperty({
    description: 'Additional notes about the transaction',
    example: 'Client prefers morning appointments',
    nullable: true,
  })
  additionalNotes: string | null;

  @ApiProperty({
    description: 'Date when the transaction was created',
    type: Date,
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the transaction was last updated',
    type: Date,
    example: '2024-01-16T14:20:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Total number of workflow items',
    example: 15,
  })
  totalWorkflowItems: number;

  @ApiProperty({
    description: 'Number of completed workflow items',
    example: 8,
  })
  completedWorkflowItems: number;

  @ApiProperty({
    description: 'Date of the next incomplete workflow item',
    type: Date,
    example: '2024-01-20T09:00:00Z',
    nullable: true,
  })
  nextIncompleteItemDate: Date | null;

  // Property details
  @ApiProperty({
    description: 'Address of the property',
    example: '123 Main St, Downtown, City 12345',
    nullable: true,
  })
  propertyAddress: string | null;

  @ApiProperty({
    description: 'Price/value of the property',
    example: 450000,
    nullable: true,
  })
  propertyPrice: number | null;

  @ApiProperty({
    description: 'Size of the property in square feet',
    example: 2500,
    nullable: true,
  })
  propertySize: number | null;

  @ApiProperty({
    description: 'Number of bedrooms',
    example: 3,
    nullable: true,
  })
  propertyBedrooms: number | null;

  @ApiProperty({
    description: 'Number of bathrooms',
    example: 2,
    nullable: true,
  })
  propertyBathrooms: number | null;

  // Client details
  @ApiProperty({
    description: 'Name of the client',
    example: 'John Doe',
    nullable: true,
  })
  clientName: string | null;

  @ApiProperty({
    description: 'Email of the client',
    example: 'john.doe@email.com',
    nullable: true,
  })
  clientEmail: string | null;

  @ApiProperty({
    description: 'Phone number of the client',
    example: '+15551234567',
    nullable: true,
  })
  clientPhoneNumber: string | null;
}
