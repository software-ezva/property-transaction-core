import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';
import { ProfileType } from '../../common/enums/profile-type.enum';
import { BrokerProfile } from '../entities/broker-profile.entity';
import { Brokerage } from '../entities/brokerage.entity';
import { CreateBrokerProfileDto } from '../dto/create-broker-profile.dto';
import {
  UserAlreadyHasAProfileException,
  BrokerProfileNotFoundException,
  UserIsNotBrokerException,
  AlreadyAssociatedWithBrokerageException,
} from '../exceptions';
import { UsersService } from './users.service';
import { BrokerageService } from './brokerage.service';
import {
  BrokerageDetailResponseDto,
  ProfileSummaryDto,
  SupportingProfessionalSummaryDto,
} from '../dto/brokerage-detail-response.dto';

@Injectable()
export class BrokerProfilesService {
  private readonly logger = new Logger(BrokerProfilesService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(BrokerProfile)
    private brokerProfileRepository: Repository<BrokerProfile>,
    private readonly userService: UsersService,
    private readonly brokerageService: BrokerageService,
  ) {}

  async assignBrokerProfile(
    auth0Id: string,
    dto: CreateBrokerProfileDto,
  ): Promise<Profile> {
    const user = await this.userService.getUserByAuth0Id(auth0Id);

    const existingProfile = user.profile as BrokerProfile | undefined;
    if (existingProfile && existingProfile.profileType === ProfileType.BROKER) {
      this.logger.warn(
        `User already has a profile of type: ${existingProfile.profileType}`,
      );
      throw new UserAlreadyHasAProfileException(existingProfile.profileType);
    }

    const profile = await this.createBroker(
      user,
      dto.esign_name,
      dto.esign_initials,
      dto.phone_number,
      dto.license_number,
      dto.mls_number,
    );

    user.profile = profile;
    await this.userRepository.save(user);
    this.logger.log(`Assigned broker profile for user: ${auth0Id}`);
    return profile;
  }

  async createBroker(
    user: User,
    esign_name: string,
    esign_initials: string,
    phoneNumber: string,
    licenseNumber?: string,
    mlsNumber?: string,
  ): Promise<BrokerProfile> {
    const brokerProfile = this.brokerProfileRepository.create({
      user,
      profileType: ProfileType.BROKER,
      esignName: esign_name,
      esignInitials: esign_initials,
      phoneNumber: phoneNumber,
      licenseNumber: licenseNumber,
      mlsNumber: mlsNumber,
    });

    return await this.brokerProfileRepository.save(brokerProfile);
  }

  async getBrokerById(brokerId: string): Promise<BrokerProfile | null> {
    const brokerProfile = await this.brokerProfileRepository.findOne({
      where: { id: brokerId },
      relations: ['user', 'brokerage'],
    });

    if (!brokerProfile) {
      this.logger.warn(`Broker profile with ID ${brokerId} not found`);
      throw new BrokerProfileNotFoundException(brokerId);
    }

    return brokerProfile;
  }

  async getBrokersByBrokerage(brokerageId: string): Promise<BrokerProfile[]> {
    return await this.brokerProfileRepository.find({
      where: { brokerage: { id: brokerageId } },
      relations: ['user', 'brokerage'],
    });
  }

  async removeBrokerFromBrokerage(brokerId: string): Promise<BrokerProfile> {
    const broker = await this.brokerProfileRepository.findOne({
      where: { id: brokerId },
      relations: ['brokerage'],
    });

    if (!broker) {
      this.logger.warn(`Broker profile with ID ${brokerId} not found`);
      throw new BrokerProfileNotFoundException(brokerId);
    }

    broker.brokerage = undefined;
    const updatedBroker = await this.brokerProfileRepository.save(broker);

    this.logger.log(`Broker ${brokerId} removed from brokerage`);

    return updatedBroker;
  }

  async getBrokerageByBroker(
    auth0Id: string,
  ): Promise<BrokerageDetailResponseDto | null> {
    this.logger.log(`Retrieving brokerage for broker with auth0Id: ${auth0Id}`);

    // Get the broker user
    const user = await this.userService.getUserByAuth0Id(auth0Id);

    // Verify the user has a broker profile
    const brokerProfile = await this.brokerProfileRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['brokerage'],
    });

    if (!brokerProfile) {
      this.logger.warn(
        `User ${auth0Id} does not have a broker profile assigned`,
      );
      throw new BrokerProfileNotFoundException(user.id);
    }

    // Return null if the broker is not assigned to any brokerage
    if (!brokerProfile.brokerage) {
      this.logger.log(
        `Broker ${auth0Id} is not assigned to any brokerage - returning null`,
      );
      return null;
    }

    // Get the full brokerage details with all relations
    const brokerage = await this.brokerageService.findByIdWithRelations(
      brokerProfile.brokerage.id,
    );

    this.logger.log(
      `Successfully retrieved brokerage ${brokerage.name} for broker ${auth0Id}`,
    );

    // Map and return the response
    return this.mapBrokerageToDetailDto(brokerage);
  }

  private mapBrokerageToDetailDto(
    brokerage: Brokerage,
  ): BrokerageDetailResponseDto {
    const agents: ProfileSummaryDto[] = brokerage.realEstateAgents.map(
      (agent) => ({
        email: agent.user.email,
        fullName: agent.user.fullName,
      }),
    );

    const brokers: ProfileSummaryDto[] = brokerage.brokers.map((broker) => ({
      email: broker.user.email,
      fullName: broker.user.fullName,
    }));

    const supportingProfessionals: SupportingProfessionalSummaryDto[] =
      brokerage.supportingProfessionals.map((sp) => ({
        email: sp.user.email,
        fullName: sp.user.fullName,
        professionalOf: sp.professionalOf,
      }));

    return {
      id: brokerage.id,
      name: brokerage.name,
      address: brokerage.address,
      county: brokerage.county,
      city: brokerage.city,
      state: brokerage.state,
      phoneNumber: brokerage.phoneNumber,
      email: brokerage.email,
      accessCode: brokerage.accessCode,
      agents,
      brokers,
      supportingProfessionals,
      createdAt: brokerage.createdAt,
    };
  }

  async joinBrokerageWithCode(
    auth0Id: string,
    accessCode: string,
  ): Promise<BrokerProfile> {
    const user = await this.userService.getUserByAuth0Id(auth0Id);
    if (!user.isBroker()) {
      this.logger.warn(`User with ID ${auth0Id} is not a broker`);
      throw new UserIsNotBrokerException();
    }

    // Get broker profile
    const broker = user.profile as BrokerProfile;

    if (broker.brokerage != null) {
      this.logger.warn(
        `Broker ${broker.id} is already associated with a brokerage`,
      );
      throw new AlreadyAssociatedWithBrokerageException(user.fullName);
    }

    // Validate and get brokerage
    const brokerage =
      await this.brokerageService.validateAndGetBrokerageForJoin(accessCode);

    return this.assignBrokerToBrokerage(broker, brokerage);
  }

  async assignBrokerToBrokerage(
    brokerProfile: BrokerProfile,
    brokerage: Brokerage,
  ): Promise<BrokerProfile> {
    brokerProfile.brokerage = brokerage;
    const updated = await this.brokerProfileRepository.save(brokerProfile);

    this.logger.log(
      `Broker ${brokerProfile.id} assigned to brokerage ${brokerage.name}`,
    );

    return updated;
  }
}
