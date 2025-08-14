import { ApiProperty } from '@nestjs/swagger';

export class UpdateItemResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the updated item',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Item updated successfully',
  })
  message: string;
}
