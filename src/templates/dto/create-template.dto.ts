import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../../common/enums';

export class CreateItemTemplateDto {
  @ApiProperty({
    description: 'Task description for the checklist item',
    example: 'Property deed verification',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description:
      'Order position of the item within the checklist (starting from 1)',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  order: number;
}

export class CreateChecklistTemplateDto {
  @ApiProperty({
    description: 'Name of the checklist',
    example: 'Documentation Checklist',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the checklist purpose',
    example: 'Collect all required documents for the transaction',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description:
      'Order position of the checklist within the workflow (starting from 1)',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiProperty({
    description: 'List of items for this checklist',
    type: [CreateItemTemplateDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemTemplateDto)
  items: CreateItemTemplateDto[];
}

export class CreateTemplateDto {
  @ApiProperty({
    description: 'Name of the workflow template',
    example: 'Property Sale Workflow',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Type of transaction this template is for',
    enum: TransactionType,
    example: TransactionType.PURCHASE,
  })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({
    description: 'List of checklists for this workflow template',
    type: [CreateChecklistTemplateDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChecklistTemplateDto)
  checklistTemplates: CreateChecklistTemplateDto[];
}
