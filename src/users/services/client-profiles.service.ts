import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';
import { ProfileType } from '../../common/enums/profile-type.enum';
import { ClientProfile } from '../entities/client-profile.entity';
import { CreateClientProfileDto } from '../dto/create-client-profile.dto';
import { UserAlreadyHasAProfileException } from '../exceptions';
import { UsersService } from './users.service';

@Injectable()
export class ClientProfilesService {
  private readonly logger = new Logger(ClientProfilesService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ClientProfile)
    private clientProfileRepository: Repository<ClientProfile>,
    private readonly userService: UsersService,
  ) {}

  async assignClientProfile(
    auth0Id: string,
    dto: CreateClientProfileDto,
  ): Promise<Profile> {
    const user = await this.userService.getUserByAuth0Id(auth0Id);

    const existingProfile = user.profile as ClientProfile | undefined;

    if (existingProfile && existingProfile.profileType === ProfileType.CLIENT) {
      this.logger.warn(
        `User already has a profile of type: ${existingProfile.profileType}`,
      );
      throw new UserAlreadyHasAProfileException(existingProfile.profileType);
    }

    const profile = await this.createClient(
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

  async getClientById(clientId: string): Promise<ClientProfile | null> {
    return await this.clientProfileRepository.findOne({
      where: { id: clientId },
      relations: ['user'],
    });
  }

  async getClientByUserId(userId: string): Promise<ClientProfile | null> {
    return await this.clientProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
}
