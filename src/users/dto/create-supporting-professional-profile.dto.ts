import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, Matches } from 'class-validator';
import { ProfessionalType } from '../../common/enums';

export class CreateSupportingProfessionalProfileDto {
  @ApiProperty({ example: 'John Smith', description: 'Name for e-signature' })
  @IsString()
  esign_name: string;

  @ApiProperty({ example: 'JS', description: 'Initials for e-signature' })
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

  @ApiProperty({
    enum: ProfessionalType,
    example: ProfessionalType.ATTORNEY,
    description: 'Type of supporting professional',
  })
  @IsEnum(ProfessionalType)
  professional_of: ProfessionalType;
}
