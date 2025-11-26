import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';
import { ProfileType } from '../../common/enums/profile-type.enum';
import { TransactionCoordinatorAgentProfile } from '../entities/transaction-coordinator-agent-profile.entity';
import { CreateTransactionCoordinatorAgentProfileDto } from '../dto/create-transaction-coordinator-agent-profile.dto';
import { UserAlreadyHasAProfileException } from '../exceptions';
import { UsersService } from './users.service';

@Injectable()
export class TransactionCoordinatorAgentProfilesService {
  private readonly logger = new Logger(
    TransactionCoordinatorAgentProfilesService.name,
  );

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TransactionCoordinatorAgentProfile)
    private transactionCoordinatorAgentProfileRepository: Repository<TransactionCoordinatorAgentProfile>,
    private readonly userService: UsersService,
  ) {}

  async assignTransactionCoordinatorAgentProfile(
    auth0Id: string,
    dto: CreateTransactionCoordinatorAgentProfileDto,
  ): Promise<Profile> {
    const user = await this.userService.getUserByAuth0Id(auth0Id);

    const existingProfile = user.profile as
      | TransactionCoordinatorAgentProfile
      | undefined;
    if (
      existingProfile &&
      existingProfile.profileType === ProfileType.TRANSACTION_COORDINATOR_AGENT
    ) {
      this.logger.warn(
        `User already has a profile of type: ${existingProfile.profileType}`,
      );
      throw new UserAlreadyHasAProfileException(existingProfile.profileType);
    }

    const profile = await this.createTransactionCoordinatorAgent(
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

  async createTransactionCoordinatorAgent(
    user: User,
    esign_name: string,
    esign_initials: string,
    phoneNumber: string,
    licenseNumber: string,
    mlsNumber?: string,
  ): Promise<TransactionCoordinatorAgentProfile> {
    const agentProfile =
      this.transactionCoordinatorAgentProfileRepository.create({
        user,
        profileType: ProfileType.TRANSACTION_COORDINATOR_AGENT,
        esignName: esign_name,
        esignInitials: esign_initials,
        phoneNumber: phoneNumber,
        licenseNumber: licenseNumber,
        mlsNumber: mlsNumber,
      });

    return await this.transactionCoordinatorAgentProfileRepository.save(
      agentProfile,
    );
  }

  async getAllTransactionCoordinatorsAgents(): Promise<Partial<User>[]> {
    const agents = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
      .innerJoin('user.profile', 'profile')
      .where('profile.profileType = :profileType', {
        profileType: ProfileType.TRANSACTION_COORDINATOR_AGENT,
      })
      .getMany();

    this.logger.log(`Found ${agents.length} agents`);
    return agents;
  }

  async getTransactionCoordinatorAgentById(
    agentId: string,
  ): Promise<TransactionCoordinatorAgentProfile | null> {
    return await this.transactionCoordinatorAgentProfileRepository.findOne({
      where: { id: agentId },
      relations: ['user', 'brokerage'],
    });
  }
}
