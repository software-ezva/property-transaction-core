import { TransactionType } from '../../common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsUUID,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'The ID of the property for the transaction',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID(4, { message: 'Property ID must be a valid UUID' })
  propertyId: string;

  @ApiPropertyOptional({
    description: 'The ID of the client user (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Client ID must be a valid UUID' })
  clientId?: string;

  @ApiProperty({
    description:
      'The type of transaction that determines the workflow template',
    enum: TransactionType,
    example: 'Purchase',
  })
  @IsEnum(TransactionType, {
    message: `Transaction type must be one of: ${Object.values(TransactionType).join(', ')}`,
  })
  transactionType: TransactionType;

  @ApiPropertyOptional({
    description: 'Additional notes or comments about the transaction',
    example: 'Client prefers morning appointments',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Additional notes cannot exceed 500 characters',
  })
  additionalNotes?: string;
}
