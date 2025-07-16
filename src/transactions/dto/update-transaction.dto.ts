import { PartialType } from '@nestjs/swagger';
import { CreateTransactionDto } from './create-transaction.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { TransactionStatus } from '../../common/enums';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
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
}
