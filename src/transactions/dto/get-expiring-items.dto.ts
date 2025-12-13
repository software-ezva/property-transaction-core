import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetExpiringItemsDto {
  @ApiPropertyOptional({
    description:
      'Number of days to look ahead for expiring items. Default is 7.',
    minimum: 1,
    maximum: 365,
    default: 7,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number = 7;
}
