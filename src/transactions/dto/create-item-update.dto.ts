import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemUpdateDto {
  @ApiProperty({
    description: 'The content of the update/comment',
    example: 'Documents have been submitted for review',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'The name of the user creating the update',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  userName: string;
}
