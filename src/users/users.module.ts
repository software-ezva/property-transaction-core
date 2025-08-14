import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { RealEstateAgentProfile } from './entities/real-estate-agent-profile.entity';
import { ClientProfile } from './entities/client-profile.entity';
import { Brokerage } from './entities/brokerage.entity';
import { ProfilesService } from './services/profiles.service';
import { BrokerageService } from './services/brokerage.service';
import { BrokerageController } from './controllers/brokerage.controller';
import { ClientsController } from './controllers/clients.controller';
import { AgentsController } from './controllers/agents.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      RealEstateAgentProfile,
      ClientProfile,
      Brokerage,
    ]),
  ],
  controllers: [
    UsersController,
    ClientsController,
    AgentsController,
    BrokerageController,
  ],
  providers: [UsersService, ProfilesService, BrokerageService],
  exports: [ProfilesService, UsersService, BrokerageService, TypeOrmModule],
})
export class UsersModule {}
