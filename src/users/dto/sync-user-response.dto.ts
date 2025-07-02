import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';

export class SyncUserResponseDto {
  @ApiProperty({ description: 'User information', type: User })
  user: User;

  @ApiProperty({
    description: 'User profile (real estate agent or client)',
    type: Profile,
    nullable: true,
  })
  profile: Profile | null;

  @ApiProperty({ description: 'Whether this is a newly created user' })
  isNewUser: boolean;

  @ApiProperty({ description: 'Success message' })
  message: string;

  constructor(user: User, isNewUser: boolean) {
    this.user = user;
    this.profile = user.profile || null;
    this.isNewUser = isNewUser;
    this.message = isNewUser
      ? 'User created successfully'
      : 'User synchronized successfully';
  }
}
