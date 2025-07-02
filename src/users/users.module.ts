import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { RealEstateAgentProfile } from './entities/real-estate-agent-profile.entity';
import { ClientProfile } from './entities/client-profile.entity';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      RealEstateAgentProfile,
      ClientProfile,
    ]),
  ],
  controllers: [UsersController, ProfilesController],
  providers: [UsersService, ProfilesService],
})
export class UsersModule {}
