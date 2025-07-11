import { ApiProperty } from '@nestjs/swagger';

export class SimpleUserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  id: string;

  @ApiProperty({
    description: 'User first name',
    example: 'Juan',
    nullable: true,
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Pérez',
    nullable: true,
  })
  lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'juan.perez@example.com',
  })
  email: string;
}
