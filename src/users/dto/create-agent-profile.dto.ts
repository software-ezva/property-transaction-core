import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateAgentProfileDto {
  @ApiProperty({ example: 'John Doe', description: 'Name for e-signature' })
  @IsString()
  esign_name: string;

  @ApiProperty({ example: 'JD', description: 'Initials for e-signature' })
  @IsString()
  esign_initials: string;

  @ApiProperty({ example: '123456', description: 'Real estate license number' })
  @IsString()
  @IsOptional()
  license_number?: string;
}
