import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BrokerageListResponseDto {
  @ApiProperty({ example: 'uuid-string', description: 'Unique identifier' })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'Sunshine Realty Group',
    description: 'Name of the brokerage company',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: '123 Main Street',
    description: 'Physical address of the brokerage',
    required: false,
  })
  @Expose()
  address?: string;

  @ApiProperty({
    example: 'Miami-Dade',
    description: 'County where the brokerage is located',
    required: false,
  })
  @Expose()
  county?: string;

  @ApiProperty({
    example: 'Miami',
    description: 'City where the brokerage is located',
    required: false,
  })
  @Expose()
  city?: string;

  @ApiProperty({
    example: 'FL',
    description: 'State abbreviation (e.g., CA, NY)',
    required: false,
  })
  @Expose()
  state?: string;

  @ApiProperty({
    example: '+15551234567',
    description: 'Main phone number of the brokerage',
    required: false,
  })
  @Expose()
  phoneNumber?: string;

  @ApiProperty({
    example: 'info@sunshineRealty.com',
    description: 'Email address of the brokerage',
    required: false,
  })
  @Expose()
  email?: string;
}
