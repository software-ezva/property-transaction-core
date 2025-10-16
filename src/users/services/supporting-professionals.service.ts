import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Profile, ProfileType } from '../entities/profile.entity';
import { SupportingProfessionalProfile } from '../entities/supporting-professional-profile.entity';
import { Brokerage } from '../entities/brokerage.entity';
import { CreateSupportingProfessionalProfileDto } from '../dto/create-supporting-professional-profile.dto';
import { UserAlreadyHasAProfileException } from '../exceptions';
import { UsersService } from './users.service';
import { ProfessionalType } from '../../common/enums';

@Injectable()
export class SupportingProfessionalsService {
  private readonly logger = new Logger(SupportingProfessionalsService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SupportingProfessionalProfile)
    private supportingProfessionalRepository: Repository<SupportingProfessionalProfile>,
    @InjectRepository(Brokerage)
    private brokerageRepository: Repository<Brokerage>,
    private readonly userService: UsersService,
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

  async assignToBrokerage(
    professionalId: string,
    brokerageId: string,
  ): Promise<SupportingProfessionalProfile> {
    const professional = await this.supportingProfessionalRepository.findOne({
      where: { id: professionalId },
      relations: ['brokerages'],
    });

    if (!professional) {
      throw new Error('Supporting professional not found');
    }

    const brokerage = await this.brokerageRepository.findOne({
      where: { uuid: brokerageId },
    });

    if (!brokerage) {
      throw new Error('Brokerage not found');
    }

    // Check if already assigned
    const isAlreadyAssigned = professional.brokerages.some(
      (b) => b.uuid === brokerageId,
    );

    if (!isAlreadyAssigned) {
      professional.brokerages.push(brokerage);
      await this.supportingProfessionalRepository.save(professional);
    }

    return professional;
  }

  async removeFromBrokerage(
    professionalId: string,
    brokerageId: string,
  ): Promise<SupportingProfessionalProfile> {
    const professional = await this.supportingProfessionalRepository.findOne({
      where: { id: professionalId },
      relations: ['brokerages'],
    });

    if (!professional) {
      throw new Error('Supporting professional not found');
    }

    professional.brokerages = professional.brokerages.filter(
      (b) => b.uuid !== brokerageId,
    );

    return await this.supportingProfessionalRepository.save(professional);
  }
}
