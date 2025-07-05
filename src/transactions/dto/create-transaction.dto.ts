import { TransactionType } from '../../common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'The ID of the property for the transaction',
    example: 1,
  })
  @IsNumber({}, { message: 'Property ID must be a number' })
  @IsPositive({ message: 'Property ID must be a positive number' })
  propertyId: number;

  @ApiPropertyOptional({
    description: 'The ID of the client user (optional)',
    example: 2,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Client ID must be a number' })
  @IsPositive({ message: 'Client ID must be a positive number' })
  clientId?: number;

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
