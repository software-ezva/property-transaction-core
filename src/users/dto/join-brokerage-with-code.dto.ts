import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class JoinBrokerageWithCodeDto {
  @ApiProperty({
    description:
      'Access code to join the brokerage (format: ABC123 - 3 uppercase letters followed by 3 digits)',
    example: 'XYZ123',
    minLength: 6,
    maxLength: 6,
    pattern: '^[A-Z]{3}\\d{3}$',
  })
  @IsString()
  @IsNotEmpty({ message: 'Access code is required' })
  @Length(6, 6, { message: 'Access code must be exactly 6 characters' })
  @Matches(/^[A-Z]{3}\d{3}$/, {
    message:
      'Access code must be 3 uppercase letters followed by 3 digits (e.g., ABC123)',
  })
  accessCode: string;
}
