import { ApiProperty } from '@nestjs/swagger';
import { Profile } from '../entities/profile.entity';

export class ProfileResponseDto {
  @ApiProperty({ type: () => Object })
  profile: Profile;
}
