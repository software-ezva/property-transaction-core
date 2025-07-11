import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateItemTemplateDto {
  @ApiProperty({
    description: 'Description of the item in the checklist template',
    example: 'Verify property title',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Order position for this item in the checklist',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({
    description: 'ID of the checklist template this item belongs to',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID(4)
  checklistTemplateId: string;
}
