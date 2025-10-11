import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
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
  broker_license_number?: string;

  @ApiPropertyOptional({
    description: 'Date when broker license expires',
    example: '2025-12-31',
  })
  @IsDateString()
  @IsOptional()
  license_expiration_date?: string;

  @ApiPropertyOptional({
    description: 'State where the broker is licensed',
    example: 'California',
  })
  @IsString()
  @IsOptional()
  license_state?: string;

  @ApiPropertyOptional({
    description: 'Years of experience as a broker',
    example: 10,
  })
  @IsInt()
  @IsOptional()
  years_of_experience?: number;

  @ApiProperty({
    description: 'Brokerage ID where the broker works',
    example: 'uuid-string',
  })
  @IsUUID()
  @IsNotEmpty()
  brokerage_id: string;
}
