import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsUUID,
  IsNumber,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../../common/enums';

export class UpdateItemTemplateDto {
  @ApiPropertyOptional({
    description: 'Item ID (omit for new items)',
    format: 'uuid',
    example: 'c2ggde77-9e2d-6gh0-dd8f-8dd1df502c33',
  })
  @IsOptional()
  @ValidateIf(
    (object, value) => value !== undefined && value !== null && value !== '',
  )
  @IsUUID(4, { message: 'Item ID must be a valid UUID when provided' })
  id?: string;

  @ApiProperty({
    description: 'Description of the task/item',
    example: 'Property deed verification',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Order position for this item in the checklist',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  order: number;
}

export class UpdateChecklistTemplateDto {
  @ApiPropertyOptional({
    description: 'Checklist ID (omit for new checklists)',
    format: 'uuid',
    example: 'b1ffcd88-8d1c-5fg9-cc7e-7cc0ce491b22',
  })
  @IsOptional()
  @ValidateIf(
    (object, value) => value !== undefined && value !== null && value !== '',
  )
  @IsUUID(4, { message: 'Checklist ID must be a valid UUID when provided' })
  id?: string;

  @ApiProperty({
    description: 'Name of the checklist template',
    example: 'Documentation Checklist',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the checklist template',
    example: 'Collect all required documents for the transaction',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Order position for this checklist in the workflow',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiProperty({
    description: 'List of items/tasks in this checklist',
    type: [UpdateItemTemplateDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateItemTemplateDto)
  items: UpdateItemTemplateDto[];
}

export class UpdateWorkflowTemplateDto {
  @ApiProperty({
    description: 'Name of the workflow template',
    example: 'Property Sale Workflow',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of real estate transaction',
    enum: TransactionType,
    example: TransactionType.PURCHASE,
  })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({
    description: 'Complete checklist templates with all items',
    type: [UpdateChecklistTemplateDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateChecklistTemplateDto)
  checklistTemplates: UpdateChecklistTemplateDto[];
}
