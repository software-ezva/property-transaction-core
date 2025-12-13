import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChecklistDto {
  @ApiProperty({
    description: 'Name of the checklist',
    example: 'Pre-Closing Inspection',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
