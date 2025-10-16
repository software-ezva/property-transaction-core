import { IsString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrokerProfileDto {
  @ApiProperty({
    description: 'Name used for electronic signatures',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  esign_name: string;

  @ApiProperty({
    description: 'Initials used for electronic signatures',
    example: 'JD',
  })
  @IsString()
  @IsNotEmpty()
  esign_initials: string;

  @ApiProperty({
    description: 'Phone number (US format)',
    example: '555-123-4567',
  })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiPropertyOptional({
    description: 'Broker license number',
    example: 'BR123456',
  })
  @IsString()
  @IsOptional()
  license_number?: string;

  @ApiPropertyOptional({
    description: 'MLS (Multiple Listing Service) number',
    example: 'MLS123456',
  })
  @IsString()
  @IsOptional()
  mls_number?: string;

  @ApiPropertyOptional({
    description: 'Brokerage ID where the broker works',
    example: 'uuid-string',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  brokerage_id?: string;
}
