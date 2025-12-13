import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { TransactionCoordinatorAgentProfile } from './entities/transaction-coordinator-agent-profile.entity';
import { RealEstateAgentProfile } from './entities/real-estate-agent-profile.entity';
import { ClientProfile } from './entities/client-profile.entity';
import { SupportingProfessionalProfile } from './entities/supporting-professional-profile.entity';
import { BrokerProfile } from './entities/broker-profile.entity';
import { Brokerage } from './entities/brokerage.entity';
import { TransactionCoordinatorAgentProfilesService } from './services/transaction-coordinator-agent-profiles.service';
import { RealEstateAgentProfilesService } from './services/real-estate-agent-profiles.service';
import { ClientProfilesService } from './services/client-profiles.service';
import { SupportingProfessionalsService } from './services/supporting-professionals.service';
import { BrokerProfilesService } from './services/broker-profiles.service';
import { BrokerageService } from './services/brokerage.service';
import { BrokerageController } from './controllers/brokerage.controller';
import { ClientsController } from './controllers/clients.controller';
import { AgentsController } from './controllers/transaction-coordinators-agents.controller';
import { RealEstateAgentsController } from './controllers/real-estate-agents.controller';
import { BrokersController } from './controllers/brokers.controller';
import { SupportingProfessionalsController } from './controllers/supporting-professionals.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      TransactionCoordinatorAgentProfile,
      RealEstateAgentProfile,
      ClientProfile,
      SupportingProfessionalProfile,
      BrokerProfile,
      Brokerage,
    ]),
  ],
  controllers: [
    UsersController,
    ClientsController,
    AgentsController,
    RealEstateAgentsController,
    BrokersController,
    SupportingProfessionalsController,
    BrokerageController,
  ],
  providers: [
    UsersService,
    TransactionCoordinatorAgentProfilesService,
    RealEstateAgentProfilesService,
    ClientProfilesService,
    SupportingProfessionalsService,
    BrokerProfilesService,
    BrokerageService,
  ],
  exports: [
    TransactionCoordinatorAgentProfilesService,
    RealEstateAgentProfilesService,
    ClientProfilesService,
    SupportingProfessionalsService,
    BrokerProfilesService,
    UsersService,
    BrokerageService,
    TypeOrmModule,
  ],
})
export class UsersModule {}
