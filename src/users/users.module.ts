import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { RealEstateAgentProfile } from './entities/real-estate-agent-profile.entity';
import { ClientProfile } from './entities/client-profile.entity';
import { ProfilesService } from './profiles.service';
import { ClientsController } from './clients.controller';
import { AgentsController } from './agents.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      RealEstateAgentProfile,
      ClientProfile,
    ]),
  ],
  controllers: [UsersController, ClientsController, AgentsController],
  providers: [UsersService, ProfilesService],
  exports: [ProfilesService, UsersService, TypeOrmModule],
})
export class UsersModule {}
