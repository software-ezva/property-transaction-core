import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, Matches } from 'class-validator';

export class CreateAgentProfileDto {
  @ApiProperty({ example: 'John Doe', description: 'Name for e-signature' })
  @IsString()
  esign_name: string;

  @ApiProperty({ example: 'JD', description: 'Initials for e-signature' })
  @IsString()
  esign_initials: string;

  @ApiProperty({
    example: '+15551234567',
    description: 'Phone number (US format)',
  })
  @IsString()
  @Matches(/^(\+?1)?[2-9][0-9]{2}[2-9][0-9]{2}[0-9]{4}$/, {
    message:
      'Phone number must be a valid US phone number (10 digits, area code cannot start with 0 or 1)',
  })
  phone_number: string;

  @ApiProperty({ example: '123456', description: 'Real estate license number' })
  @IsString()
  @IsOptional()
  license_number?: string;

  @ApiProperty({
    example: 'MLS123456',
    description: 'MLS (Multiple Listing Service) number',
  })
  @IsString()
  @IsOptional()
  mls_number?: string;

  @ApiProperty({
    example: 'uuid-of-brokerage',
    description: 'ID of the brokerage this agent belongs to',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  brokerage_id?: string;
}
