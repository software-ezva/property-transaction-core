import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ItemStatus } from '../../common/enums';
import { IsFutureOrTodayDate } from '../../common/validators/date.validator';

export class UpdateItemDto {
  @ApiProperty({
    description: 'Status of the item',
    enum: ItemStatus,
    example: ItemStatus.COMPLETED,
    required: false,
  })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;

  @ApiProperty({
    description: 'Expected closing date for the item (cannot be in the past)',
    type: 'string',
    format: 'date',
    example: '2024-02-15',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'expectClosingDate must be a valid date string (YYYY-MM-DD)' },
  )
  @IsFutureOrTodayDate({
    message: 'Expected closing date cannot be in the past',
  })
  expectClosingDate?: string | null;
}
