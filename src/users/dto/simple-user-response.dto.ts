import { ApiProperty } from '@nestjs/swagger';

export class SimpleUserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  id: number;

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
