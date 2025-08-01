import { ApiProperty } from '@nestjs/swagger';

export class UpdateTemplateResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the updated workflow template',
    format: 'uuid',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  templateId: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Template updated successfully',
  })
  message: string;
}
