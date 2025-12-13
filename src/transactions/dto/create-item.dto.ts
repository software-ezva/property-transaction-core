import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({
    description: 'Description of the item',
    example: 'Verify smoke detectors',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
