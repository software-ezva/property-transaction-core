import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionResponseDto {
  @ApiProperty({
    description: 'The ID of the created transaction',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  transactionId: string;

  @ApiPropertyOptional({
    description: 'A message confirming the transaction creation',
    example: 'Transaction created successfully',
  })
  message?: string;
}
