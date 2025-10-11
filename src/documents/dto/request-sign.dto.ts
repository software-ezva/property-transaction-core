import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class RequestSignDto {
  @ApiProperty({
    example: '507f1f77-bcf8-6cd7-9943-9011abc12345',
    description: 'UUID of the user who will sign the document',
  })
  @IsString()
  @IsUUID()
  userId: string;
}
