import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Profile, ProfileType } from '../entities/profile.entity';
import { RealEstateAgentProfile } from '../entities/real-estate-agent-profile.entity';
import { ClientProfile } from '../entities/client-profile.entity';
import { Brokerage } from '../entities/brokerage.entity';
import { CreateAgentProfileDto } from '../dto/create-agent-profile.dto';
import { CreateClientProfileDto } from '../dto/create-client-profile.dto';
import { UserAlreadyHasAProfileException } from '../exceptions';
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
    @InjectRepository(Brokerage)
    private brokerageRepository: Repository<Brokerage>,
    private readonly userService: UsersService,
  ) {}

  async assignAgentProfile(
    auth0Id: string,
    dto: CreateAgentProfileDto,
  ): Promise<Profile> {
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
      dto.phone_number,
      dto.license_number ?? '',
      dto.mls_number,
      dto.brokerage_id,
    );

    user.profile = profile;
    await this.userRepository.save(user);
    this.logger.log(`Assigned agent profile for user: ${auth0Id}`);
    return profile;
  }

  async createAgent(
    user: User,
    esign_name: string,
    esign_initials: string,
    phoneNumber: string,
    licenseNumber: string,
    mlsNumber?: string,
    brokerageId?: string,
  ): Promise<RealEstateAgentProfile> {
    let brokerage: Brokerage | undefined;

    if (brokerageId) {
      brokerage =
        (await this.brokerageRepository.findOne({
          where: { id: brokerageId },
        })) || undefined;
    }

    const agentProfile = this.agentProfileRepository.create({
      user,
      profileType: ProfileType.REAL_ESTATE_AGENT,
      esignName: esign_name,
      esignInitials: esign_initials,
      phoneNumber: phoneNumber,
      licenseNumber: licenseNumber,
      mlsNumber: mlsNumber,
      brokerage: brokerage,
    });
    return await this.agentProfileRepository.save(agentProfile);
  }

  async assignClientProfile(
    auth0Id: string,
    dto: CreateClientProfileDto,
  ): Promise<Profile> {
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
      dto.phone_number,
      dto.date_of_birth ? new Date(dto.date_of_birth) : undefined,
    );

    user.profile = profile;
    await this.userRepository.save(user);
    this.logger.log(`Assigned client profile for user: ${auth0Id}`);
    return profile;
  }

  async createClient(
    user: User,
    esign_name: string,
    esign_initials: string,
    phoneNumber: string,
    dateOfBirth?: Date,
  ): Promise<ClientProfile> {
    const clientProfile = this.clientProfileRepository.create({
      user: user,
      profileType: ProfileType.CLIENT,
      esignName: esign_name,
      esignInitials: esign_initials,
      phoneNumber: phoneNumber,
      dateOfBirth: dateOfBirth,
    });
    return await this.clientProfileRepository.save(clientProfile);
  }

  async getAllClients(): Promise<Partial<User>[]> {
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
  }

  async getAllAgents(): Promise<Partial<User>[]> {
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
  }
}
