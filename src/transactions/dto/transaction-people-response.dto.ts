import { ApiProperty } from '@nestjs/swagger';

export class PersonDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Full Name' })
  fullName: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Phone number' })
  phoneNumber: string;
}

export class SupportingProfessionalDto extends PersonDto {
  @ApiProperty({ description: 'Profession type' })
  professionOf: string;
}

export class TransactionPeopleResponseDto {
  @ApiProperty({ description: 'Transaction Access Code' })
  accessCode: string;

  @ApiProperty({
    description: 'Client details',
    type: PersonDto,
    nullable: true,
  })
  client: PersonDto | null;

  @ApiProperty({
    description: 'Real Estate Agent details',
    type: PersonDto,
    nullable: true,
  })
  realEstateAgent: PersonDto | null;

  @ApiProperty({
    description: 'List of Supporting Professionals',
    type: [SupportingProfessionalDto],
  })
  supportingProfessionals: SupportingProfessionalDto[];
}
