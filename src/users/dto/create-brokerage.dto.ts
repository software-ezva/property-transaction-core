import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, Matches } from 'class-validator';

export class CreateBrokerageDto {
  @ApiProperty({
    example: 'Sunshine Realty Group',
    description: 'Name of the brokerage company',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '123 Main Street',
    description: 'Physical address of the brokerage',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    example: 'Miami-Dade',
    description: 'County where the brokerage is located',
    required: false,
  })
  @IsString()
  @IsOptional()
  county?: string;

  @ApiProperty({
    example: 'Miami',
    description: 'City where the brokerage is located',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    example: 'FL',
    description: 'State abbreviation (e.g., CA, NY)',
    required: false,
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({
    example: '+15551234567',
    description: 'Main phone number of the brokerage',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^(\+?1)?[2-9][0-9]{2}[2-9][0-9]{2}[0-9]{4}$/, {
    message:
      'Phone number must be a valid US phone number (10 digits, area code cannot start with 0 or 1)',
  })
  phoneNumber?: string;

  @ApiProperty({
    example: 'info@sunshineRealty.com',
    description: 'Email address of the brokerage',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
