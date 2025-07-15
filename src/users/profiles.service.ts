import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Profile, ProfileType } from './entities/profile.entity';
import { RealEstateAgentProfile } from './entities/real-estate-agent-profile.entity';
import { ClientProfile } from './entities/client-profile.entity';
import { CreateAgentProfileDto } from './dto/create-agent-profile.dto';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { UserAlreadyHasAProfileException } from '../common/exceptions';
import { UsersService } from './users.service';

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RealEstateAgentProfile)
    private agentProfileRepository: Repository<RealEstateAgentProfile>,
    @InjectRepository(ClientProfile)
    private clientProfileRepository: Repository<ClientProfile>,
    private readonly userService: UsersService,
  ) {}

  async assignAgentProfile(
    auth0Id: string,
    dto: CreateAgentProfileDto,
  ): Promise<Profile> {
    try {
      const user = await this.userService.getUserByAuth0Id(auth0Id);

      let profile = user.profile as RealEstateAgentProfile | undefined;
      if (profile && profile.profileType === ProfileType.REAL_ESTATE_AGENT) {
        this.logger.warn(
          `User already has a profile of type: ${profile.profileType}`,
        );
        throw new UserAlreadyHasAProfileException(profile.profileType);
      }

      profile = await this.createAgent(
        user,
        dto.esign_name,
        dto.esign_initials,
        dto.license_number ?? '',
      );

      user.profile = profile;
      await this.userRepository.save(user);
      this.logger.log(`Assigned agent profile for user: ${auth0Id}`);
      return profile;
    } catch (error) {
      this.logger.error(
        `Failed to assign agent profile for user: ${auth0Id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async createAgent(
    user: User,
    esign_name: string,
    esign_initials: string,
    licenseNumber: string,
  ): Promise<RealEstateAgentProfile> {
    const agentProfile = this.agentProfileRepository.create({
      user,
      profileType: ProfileType.REAL_ESTATE_AGENT,
      esignName: esign_name,
      esignInitials: esign_initials,
      licenseNumber: licenseNumber,
    });
    return await this.agentProfileRepository.save(agentProfile);
  }

  async assignClientProfile(
    auth0Id: string,
    dto: CreateClientProfileDto,
  ): Promise<Profile> {
    try {
      const user = await this.userService.getUserByAuth0Id(auth0Id);

      let profile = user.profile as ClientProfile | undefined;

      if (profile && profile.profileType === ProfileType.CLIENT) {
        this.logger.warn(
          `User already has a profile of type: ${profile.profileType}`,
        );
        throw new UserAlreadyHasAProfileException(profile.profileType);
      }
      profile = await this.createClient(
        user,
        dto.esign_name,
        dto.esign_initials,
        dto.date_of_birth ? new Date(dto.date_of_birth) : undefined,
      );

      user.profile = profile;
      await this.userRepository.save(user);
      this.logger.log(`Assigned agent profile for user: ${auth0Id}`);
      return profile;
    } catch (error) {
      this.logger.error(
        `Failed to assign client profile for user: ${auth0Id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async createClient(
    user: User,
    firstName: string,
    lastName: string,
    dateOfBirth?: Date,
  ): Promise<ClientProfile> {
    const clientProfile = this.clientProfileRepository.create({
      user: user,
      profileType: ProfileType.CLIENT,
      esignName: firstName,
      esignInitials: lastName,
      dateOfBirth: dateOfBirth,
    });
    return await this.clientProfileRepository.save(clientProfile);
  }

  async getAllClients(): Promise<Partial<User>[]> {
    try {
      const clients = await this.userRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
        .innerJoin('user.profile', 'profile')
        .where('profile.profileType = :profileType', {
          profileType: ProfileType.CLIENT,
        })
        .getMany();

      this.logger.log(`Found ${clients.length} clients`);
      return clients;
    } catch (error) {
      this.logger.error(
        'Failed to retrieve clients',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async getAllAgents(): Promise<Partial<User>[]> {
    try {
      const agents = await this.userRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
        .innerJoin('user.profile', 'profile')
        .where('profile.profileType = :profileType', {
          profileType: ProfileType.REAL_ESTATE_AGENT,
        })
        .getMany();

      this.logger.log(`Found ${agents.length} agents`);
      return agents;
    } catch (error) {
      this.logger.error(
        'Failed to retrieve agents',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
