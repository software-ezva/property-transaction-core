import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateClientProfileDto {
  @ApiProperty({ example: 'Jane Doe', description: 'Name for e-signature' })
  @IsString()
  esign_name: string;

  @ApiProperty({ example: 'JD', description: 'Initials for e-signature' })
  @IsString()
  esign_initials: string;

  @ApiProperty({ example: '1990-01-01', description: 'Date of birth' })
  @IsDateString()
  @IsOptional()
  date_of_birth?: string;
}
