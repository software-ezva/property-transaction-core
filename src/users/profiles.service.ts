import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ProfileType } from './entities/profile.entity';
import { RealEstateAgentProfile } from './entities/real-estate-agent-profile.entity';
import { ClientProfile } from './entities/client-profile.entity';
import { Profile } from './entities/profile.entity';
import { CreateAgentProfileDto } from './dto/create-agent-profile.dto';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(RealEstateAgentProfile)
    private agentProfileRepository: Repository<RealEstateAgentProfile>,
    @InjectRepository(ClientProfile)
    private clientProfileRepository: Repository<ClientProfile>,
  ) {}

  async assignAgentProfile(
    auth0Id: string,
    dto: CreateAgentProfileDto,
  ): Promise<ProfileResponseDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { auth0Id },
        relations: ['profile'],
      });

      if (!user) {
        this.logger.warn(`User not found with auth0Id: ${auth0Id}`);
        throw new Error('User not found');
      }

      let profile = user.profile as RealEstateAgentProfile;

      if (!profile || profile.profileType !== ProfileType.REAL_ESTATE_AGENT) {
        profile = this.agentProfileRepository.create({
          profileType: ProfileType.REAL_ESTATE_AGENT,
          user,
          esignName: dto.esign_name,
          esignInitials: dto.esign_initials,
          licenseNumber: dto.license_number ?? '',
        });
      } else {
        profile.esignName = dto.esign_name;
        profile.esignInitials = dto.esign_initials;
        profile.licenseNumber = dto.license_number ?? '';
      }

      await this.agentProfileRepository.save(profile);
      user.profile = profile;
      await this.userRepository.save(user);

      return { profile };
    } catch (error) {
      this.logger.error(
        `Failed to assign agent profile for user: ${auth0Id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async assignClientProfile(
    auth0Id: string,
    dto: CreateClientProfileDto,
  ): Promise<ProfileResponseDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { auth0Id },
        relations: ['profile'],
      });

      if (!user) {
        this.logger.warn(`User not found with auth0Id: ${auth0Id}`);
        throw new Error('User not found');
      }

      let profile = user.profile as ClientProfile;

      if (!profile || profile.profileType !== ProfileType.CLIENT) {
        profile = this.clientProfileRepository.create({
          profileType: ProfileType.CLIENT,
          user,
          esignName: dto.esign_name,
          esignInitials: dto.esign_initials,
          dateOfBirth: dto.date_of_birth
            ? new Date(dto.date_of_birth)
            : new Date('1970-01-01'),
        });
      } else {
        profile.esignName = dto.esign_name;
        profile.esignInitials = dto.esign_initials;
        profile.dateOfBirth = dto.date_of_birth
          ? new Date(dto.date_of_birth)
          : new Date('1970-01-01');
      }

      await this.clientProfileRepository.save(profile);
      user.profile = profile;
      await this.userRepository.save(user);

      return { profile };
    } catch (error) {
      this.logger.error(
        `Failed to assign client profile for user: ${auth0Id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
