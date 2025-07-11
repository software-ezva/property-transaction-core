import { ApiProperty } from '@nestjs/swagger';

export class PropertyResponseDto {
  @ApiProperty({
    description: 'Property ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Property address',
    example: '123 Main Street, City, State 12345',
  })
  address: string;

  @ApiProperty({
    description: 'Property price',
    example: 250000,
  })
  price: number;

  @ApiProperty({
    description: 'Property size in square feet',
    example: 1500,
  })
  size: number;

  @ApiProperty({
    description: 'Number of bedrooms',
    example: 3,
  })
  bedrooms: number;

  @ApiProperty({
    description: 'Number of bathrooms',
    example: 2,
  })
  bathrooms: number;

  @ApiProperty({
    description: 'Property description',
    example: 'Beautiful family home with modern amenities',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    description: 'Date when the property was created',
    example: '2025-07-04T15:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the property was last updated',
    example: '2025-07-04T15:30:00.000Z',
  })
  updatedAt: Date;
}
