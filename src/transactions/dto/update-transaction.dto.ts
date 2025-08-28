import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsString,
  MaxLength,
} from 'class-validator';
import { TransactionStatus } from '../../common/enums';

export class UpdateTransactionDto {
  @ApiPropertyOptional({
    description: 'The status of the transaction',
    enum: TransactionStatus,
    example: TransactionStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(TransactionStatus, {
    message: `Transaction status must be one of: ${Object.values(TransactionStatus).join(', ')}`,
  })
  status?: TransactionStatus;

  @ApiPropertyOptional({
    description: 'The client ID',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Client ID must be a valid UUID' })
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the transaction',
    maxLength: 500,
    example: 'This is a note.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Additional notes cannot exceed 500 characters',
  })
  additionalNotes?: string;
}
