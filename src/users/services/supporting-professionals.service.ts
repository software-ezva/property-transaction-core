import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Profile, ProfileType } from '../entities/profile.entity';
import { SupportingProfessionalProfile } from '../entities/supporting-professional-profile.entity';
import { CreateSupportingProfessionalProfileDto } from '../dto/create-supporting-professional-profile.dto';
import {
  UserAlreadyHasAProfileException,
  SupportingProfessionalNotFoundException,
  InvalidAccessCodeFormatException,
  AlreadyAssociatedWithBrokerageException,
} from '../exceptions';
import { UsersService } from './users.service';
import { BrokerageService } from './brokerage.service';
import { ProfessionalType } from '../../common/enums';
import { AccessCodeGenerator } from '../utils/access-code.generator';

@Injectable()
export class SupportingProfessionalsService {
  private readonly logger = new Logger(SupportingProfessionalsService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SupportingProfessionalProfile)
    private supportingProfessionalRepository: Repository<SupportingProfessionalProfile>,
    private readonly userService: UsersService,
    private readonly brokerageService: BrokerageService,
  ) {}

  async assignSupportingProfessionalProfile(
    auth0Id: string,
    dto: CreateSupportingProfessionalProfileDto,
  ): Promise<Profile> {
    const user = await this.userService.getUserByAuth0Id(auth0Id);

    const existingProfile = user.profile as
      | SupportingProfessionalProfile
      | undefined;
    if (
      existingProfile &&
      existingProfile.profileType === ProfileType.SUPPORTING_PROFESSIONAL
    ) {
      this.logger.warn(
        `User already has a profile of type: ${existingProfile.profileType}`,
      );
      throw new UserAlreadyHasAProfileException(existingProfile.profileType);
    }

    const profile = await this.createSupportingProfessional(
      user,
      dto.esign_name,
      dto.esign_initials,
      dto.phone_number,
      dto.professional_of,
    );

    user.profile = profile;
    await this.userRepository.save(user);
    this.logger.log(
      `Assigned supporting professional profile for user: ${auth0Id}`,
    );
    return profile;
  }

  async createSupportingProfessional(
    user: User,
    esign_name: string,
    esign_initials: string,
    phoneNumber: string,
    professionalOf: ProfessionalType,
  ): Promise<SupportingProfessionalProfile> {
    const supportingProfessionalProfile =
      this.supportingProfessionalRepository.create({
        user,
        profileType: ProfileType.SUPPORTING_PROFESSIONAL,
        esignName: esign_name,
        esignInitials: esign_initials,
        phoneNumber: phoneNumber,
        professionalOf: professionalOf,
      });

    return await this.supportingProfessionalRepository.save(
      supportingProfessionalProfile,
    );
  }

  async getAllSupportingProfessionals(): Promise<Partial<User>[]> {
    const supportingProfessionals = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
      .innerJoin('user.profile', 'profile')
      .where('profile.profileType = :profileType', {
        profileType: ProfileType.SUPPORTING_PROFESSIONAL,
      })
      .getMany();

    this.logger.log(
      `Found ${supportingProfessionals.length} supporting professionals`,
    );
    return supportingProfessionals;
  }

  async getSupportingProfessionalById(
    professionalId: string,
  ): Promise<SupportingProfessionalProfile | null> {
    return await this.supportingProfessionalRepository.findOne({
      where: { id: professionalId },
      relations: ['user', 'brokerages'],
    });
  }

  async joinBrokerageWithCode(
    auth0Id: string,
    accessCode: string,
  ): Promise<SupportingProfessionalProfile> {
    // Validate access code format
    if (!AccessCodeGenerator.isValid(accessCode)) {
      throw new InvalidAccessCodeFormatException(accessCode);
    }

    const user = await this.userService.getUserByAuth0Id(auth0Id);
    if (!user.isSupportingProfessional()) {
      this.logger.warn(
        `User with ID ${auth0Id} is not a supporting professional`,
      );
      throw new SupportingProfessionalNotFoundException(user.id);
    }

    const professional = user.profile as SupportingProfessionalProfile;

    // Load brokerages relation
    const professionalWithBrokerages =
      await this.supportingProfessionalRepository.findOne({
        where: { id: professional.id },
        relations: ['brokerages'],
      });

    if (!professionalWithBrokerages) {
      throw new SupportingProfessionalNotFoundException(professional.id);
    }

    // Find brokerage by access code
    const brokerage = await this.brokerageService.findByAccessCode(accessCode);

    // Check if already associated
    const alreadyAssociated = professionalWithBrokerages.brokerages.some(
      (b) => b.id === brokerage.id,
    );

    if (alreadyAssociated) {
      this.logger.warn(
        `Supporting professional ${professional.id} is already associated with brokerage ${brokerage.name}`,
      );
      throw new AlreadyAssociatedWithBrokerageException(brokerage.name);
    }

    // Add brokerage to the list
    professionalWithBrokerages.brokerages.push(brokerage);
    const updated = await this.supportingProfessionalRepository.save(
      professionalWithBrokerages,
    );

    this.logger.log(
      `Supporting professional ${professional.id} joined brokerage ${brokerage.name} using access code`,
    );

    return updated;
  }
}
