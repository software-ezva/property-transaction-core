import { ApiProperty } from '@nestjs/swagger';

export class ItemUpdateResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The content of the update',
    example: 'Documents have been submitted for review',
  })
  content: string;

  @ApiProperty({
    description: 'The date when the update was created',
    example: '2023-10-27T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The ID of the user who created the update',
    example: 'auth0|123456',
  })
  createdBy: string;

  @ApiProperty({
    description: 'The name of the user who created the update',
    example: 'John Doe',
  })
  createdByName: string;
}
