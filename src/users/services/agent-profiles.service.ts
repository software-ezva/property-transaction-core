import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Profile, ProfileType } from '../entities/profile.entity';
import { RealEstateAgentProfile } from '../entities/real-estate-agent-profile.entity';
import { Brokerage } from '../entities/brokerage.entity';
import { CreateAgentProfileDto } from '../dto/create-agent-profile.dto';
import {
  UserAlreadyHasAProfileException,
  AgentProfileNotFoundException,
  InvalidAccessCodeFormatException,
  AlreadyAssociatedWithBrokerageException,
  BrokerageNotFoundException,
} from '../exceptions';
import { UsersService } from './users.service';
import { BrokerageService } from './brokerage.service';
import { AccessCodeGenerator } from '../utils/access-code.generator';

@Injectable()
export class AgentProfilesService {
  private readonly logger = new Logger(AgentProfilesService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RealEstateAgentProfile)
    private agentProfileRepository: Repository<RealEstateAgentProfile>,
    private readonly userService: UsersService,
    private readonly brokerageService: BrokerageService,
  ) {}

  async assignAgentProfile(
    auth0Id: string,
    dto: CreateAgentProfileDto,
  ): Promise<Profile> {
    const user = await this.userService.getUserByAuth0Id(auth0Id);

    const existingProfile = user.profile as RealEstateAgentProfile | undefined;
    if (
      existingProfile &&
      existingProfile.profileType === ProfileType.REAL_ESTATE_AGENT
    ) {
      this.logger.warn(
        `User already has a profile of type: ${existingProfile.profileType}`,
      );
      throw new UserAlreadyHasAProfileException(existingProfile.profileType);
    }

    const profile = await this.createAgent(
      user,
      dto.esign_name,
      dto.esign_initials,
      dto.phone_number,
      dto.license_number ?? '',
      dto.mls_number,
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
  ): Promise<RealEstateAgentProfile> {
    let brokerage: Brokerage | undefined;

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

  async getAgentById(agentId: string): Promise<RealEstateAgentProfile | null> {
    return await this.agentProfileRepository.findOne({
      where: { id: agentId },
      relations: ['user', 'brokerage'],
    });
  }

  async getAgentsByBrokerage(
    brokerageId: string,
  ): Promise<RealEstateAgentProfile[]> {
    return await this.agentProfileRepository.find({
      where: { brokerage: { id: brokerageId } },
      relations: ['user', 'brokerage'],
    });
  }

  async joinBrokerageWithCode(
    auth0Id: string,
    accessCode: string,
  ): Promise<RealEstateAgentProfile> {
    // Validate access code format
    if (!AccessCodeGenerator.isValid(accessCode)) {
      throw new InvalidAccessCodeFormatException(accessCode);
    }

    const user = await this.userService.getUserByAuth0Id(auth0Id);
    if (!user.isRealEstateAgent()) {
      this.logger.warn(`User with ID ${auth0Id} is not a real estate agent`);
      throw new AgentProfileNotFoundException(user.id);
    }
    // Get agent profile
    const agent = user.profile as RealEstateAgentProfile;

    if (agent.brokerage != null) {
      this.logger.warn(
        `Agent ${agent.id} is already associated with a brokerage`,
      );
      throw new AlreadyAssociatedWithBrokerageException(user.fullName);
    }

    // Find brokerage by access code
    const brokerage = await this.brokerageService.findByAccessCode(accessCode);

    if (!brokerage) {
      throw new BrokerageNotFoundException(accessCode);
    }

    // Assign agent to brokerage
    agent.brokerage = brokerage;
    const updated = await this.agentProfileRepository.save(agent);

    this.logger.log(
      `Agent ${agent.id} joined brokerage ${brokerage.name} using access code`,
    );

    return updated;
  }
}
