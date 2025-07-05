import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength } from 'class-validator';
import { TransactionType } from '../../common/enums';

export class CreateWorkflowTemplateDto {
  @ApiProperty({
    description: 'Type of real estate transaction this template applies to',
    enum: TransactionType,
    example: 'Purchase',
  })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({
    description: 'Name of the workflow template',
    example: 'Purchase Workflow',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;
}
