import { ApiProperty } from '@nestjs/swagger';
import { ProfessionalType } from '../../common/enums';

export class ProfileSummaryDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  fullName: string;
}

export class SupportingProfessionalSummaryDto extends ProfileSummaryDto {
  @ApiProperty({
    description: 'Type of supporting professional',
    enum: ProfessionalType,
    example: ProfessionalType.ATTORNEY,
  })
  professionalOf: ProfessionalType;
}

export class BrokerageDetailResponseDto {
  @ApiProperty({
    description: 'Brokerage unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the brokerage company',
    example: 'Premium Real Estate Brokerage',
  })
  name: string;

  @ApiProperty({
    description: 'Physical address of the brokerage',
    example: '123 Main Street, Suite 100',
    required: false,
  })
  address?: string;

  @ApiProperty({
    description: 'County where the brokerage is located',
    example: 'Los Angeles County',
    required: false,
  })
  county?: string;

  @ApiProperty({
    description: 'City where the brokerage is located',
    example: 'Beverly Hills',
    required: false,
  })
  city?: string;

  @ApiProperty({
    description: 'State abbreviation',
    example: 'CA',
    required: false,
  })
  state?: string;

  @ApiProperty({
    description: 'Main phone number of the brokerage',
    example: '+1-555-123-4567',
    required: false,
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Email address of the brokerage',
    example: 'info@premiumrealestate.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description:
      'Access code to join this brokerage (6-character format: ABC123)',
    example: 'ABC123',
  })
  accessCode: string;

  @ApiProperty({
    description: 'Real estate agents associated with this brokerage',
    type: [ProfileSummaryDto],
    isArray: true,
  })
  agents: ProfileSummaryDto[];

  @ApiProperty({
    description: 'Brokers associated with this brokerage',
    type: [ProfileSummaryDto],
    isArray: true,
  })
  brokers: ProfileSummaryDto[];

  @ApiProperty({
    description: 'Supporting professionals associated with this brokerage',
    type: [SupportingProfessionalSummaryDto],
    isArray: true,
  })
  supportingProfessionals: SupportingProfessionalSummaryDto[];

  @ApiProperty({
    description: 'Date when the brokerage was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;
}
