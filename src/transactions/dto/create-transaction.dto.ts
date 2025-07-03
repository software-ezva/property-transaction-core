import { TransactionType } from '../../common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'The ID of the property for the transaction',
    example: 1,
  })
  propertyId: number;

  @ApiProperty({
    description: 'The ID of the real estate agent handling the transaction',
    example: 1,
  })
  agentId: number;

  @ApiPropertyOptional({
    description: 'The ID of the client user (optional)',
    example: 2,
  })
  clientId?: number;

  @ApiProperty({
    description:
      'The type of transaction that determines the workflow template',
    enum: TransactionType,
    example: 'Purchase',
  })
  transactionType: TransactionType;
}
