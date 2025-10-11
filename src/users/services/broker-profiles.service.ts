import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Profile, ProfileType } from '../entities/profile.entity';
import { BrokerProfile } from '../entities/broker-profile.entity';
import { Brokerage } from '../entities/brokerage.entity';
import { CreateBrokerProfileDto } from '../dto/create-broker-profile.dto';
import { UserAlreadyHasAProfileException } from '../exceptions';
import { UsersService } from './users.service';

@Injectable()
export class BrokerProfilesService {
  private readonly logger = new Logger(BrokerProfilesService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(BrokerProfile)
    private brokerProfileRepository: Repository<BrokerProfile>,
    @InjectRepository(Brokerage)
    private brokerageRepository: Repository<Brokerage>,
    private readonly userService: UsersService,
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
      dto.brokerage_id,
      dto.broker_license_number,
      dto.license_expiration_date
        ? new Date(dto.license_expiration_date)
        : undefined,
      dto.license_state,
      dto.years_of_experience,
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
    brokerageId: string,
    brokerLicenseNumber?: string,
    licenseExpirationDate?: Date,
    licenseState?: string,
    yearsOfExperience?: number,
  ): Promise<BrokerProfile> {
    const brokerage = await this.brokerageRepository.findOne({
      where: { id: brokerageId },
    });

    if (!brokerage) {
      throw new Error('Brokerage not found');
    }

    const brokerProfile = this.brokerProfileRepository.create({
      user,
      profileType: ProfileType.BROKER,
      esignName: esign_name,
      esignInitials: esign_initials,
      phoneNumber: phoneNumber,
      brokerage: brokerage,
      brokerLicenseNumber: brokerLicenseNumber,
      licenseExpirationDate: licenseExpirationDate,
      licenseState: licenseState,
      yearsOfExperience: yearsOfExperience,
    });

    return await this.brokerProfileRepository.save(brokerProfile);
  }

  async getAllBrokers(): Promise<Partial<User>[]> {
    const brokers = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
      .innerJoin('user.profile', 'profile')
      .where('profile.profileType = :profileType', {
        profileType: ProfileType.BROKER,
      })
      .getMany();

    this.logger.log(`Found ${brokers.length} brokers`);
    return brokers;
  }

  async getBrokerById(brokerId: string): Promise<BrokerProfile | null> {
    return await this.brokerProfileRepository.findOne({
      where: { id: brokerId },
      relations: ['user', 'brokerage'],
    });
  }

  async getBrokersByBrokerage(brokerageId: string): Promise<BrokerProfile[]> {
    return await this.brokerProfileRepository.find({
      where: { brokerage: { id: brokerageId } },
      relations: ['user', 'brokerage'],
    });
  }
}
