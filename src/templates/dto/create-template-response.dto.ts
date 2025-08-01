import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateResponseDto {
  @ApiProperty({
    description: 'ID of the created template',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  templateId: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Template created successfully',
  })
  message: string;
}
