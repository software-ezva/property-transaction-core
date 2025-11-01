import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brokerage } from '../entities/brokerage.entity';
import { BrokerProfile } from '../entities/broker-profile.entity';
import { CreateBrokerageDto } from '../dto/create-brokerage.dto';
import { UpdateBrokerageDto } from '../dto/update-brokerage.dto';
import { AccessCodeGenerator } from '../utils/access-code.generator';
import { UsersService } from './users.service';
import {
  UserIsNotBrokerException,
  BrokerageWithAccessCodeNotFoundException,
  ProfileNotFoundException,
} from '../exceptions';

@Injectable()
export class BrokerageService {
  private readonly logger = new Logger(BrokerageService.name);

  constructor(
    @InjectRepository(Brokerage)
    private brokerageRepository: Repository<Brokerage>,
    @InjectRepository(BrokerProfile)
    private brokerProfileRepository: Repository<BrokerProfile>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    auth0Id: string,
    createBrokerageDto: CreateBrokerageDto,
  ): Promise<Brokerage> {
    try {
      console.log('createBrokerageDto:', createBrokerageDto);
      // Validate that user is a broker
      const user = await this.usersService.getUserByAuth0Id(auth0Id);
      if (!user.isBroker()) {
        this.logger.warn(`User with ID ${auth0Id} is not a broker`);
        throw new UserIsNotBrokerException();
      }

      // Get broker profile
      const brokerProfile = user.profile as BrokerProfile;

      // Create brokerage with access code
      const brokerage = this.brokerageRepository.create(createBrokerageDto);
      brokerage.accessCode = await this.getUniqueAccessCode();

      const savedBrokerage = await this.brokerageRepository.save(brokerage);

      // Assign the brokerage to the broker who created it
      brokerProfile.brokerage = savedBrokerage;
      await this.brokerProfileRepository.save(brokerProfile);

      this.logger.log(
        `Created brokerage: ${savedBrokerage.name} with access code: ${savedBrokerage.accessCode}. Assigned to broker: ${user.firstName} ${user.lastName}`,
      );
      return savedBrokerage;
    } catch (error) {
      this.logger.error(
        `Failed to create brokerage: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async findAll(auth0Id: string): Promise<Brokerage[]> {
    const user = await this.usersService.getUserByAuth0Id(auth0Id);

    if (!user.profile) {
      this.logger.warn(`User with ID ${auth0Id} has no profile`);
      return [];
    }

    const relation = user.getProfileRelation();

    if (!relation) {
      throw new ProfileNotFoundException(user.profile.id);
    }

    return await this.brokerageRepository
      .createQueryBuilder('brokerage')
      .innerJoin(`brokerage.${relation}`, 'profile')
      .where('profile.id = :profileId', { profileId: user.profile.id })
      .select([
        'brokerage.id',
        'brokerage.name',
        'brokerage.address',
        'brokerage.county',
        'brokerage.city',
        'brokerage.state',
        'brokerage.phoneNumber',
        'brokerage.email',
      ])
      .getMany();
  }

  async findOne(id: string): Promise<Brokerage> {
    const brokerage = await this.brokerageRepository.findOne({
      where: { id },
    });

    if (!brokerage) {
      throw new NotFoundException(`Brokerage with ID ${id} not found`);
    }

    return brokerage;
  }

  async update(
    id: string,
    updateBrokerageDto: UpdateBrokerageDto,
  ): Promise<Brokerage> {
    const brokerage = await this.findOne(id);

    Object.assign(brokerage, updateBrokerageDto);

    const updatedBrokerage = await this.brokerageRepository.save(brokerage);
    this.logger.log(`Updated brokerage: ${updatedBrokerage.name}`);

    return updatedBrokerage;
  }

  async remove(id: string): Promise<void> {
    const brokerage = await this.findOne(id);
    await this.brokerageRepository.remove(brokerage);
    this.logger.log(`Removed brokerage: ${brokerage.name}`);
  }

  async findByAccessCode(accessCode: string): Promise<Brokerage> {
    const brokerage = await this.brokerageRepository.findOne({
      where: { accessCode: accessCode.toUpperCase() },
    });

    if (!brokerage) {
      this.logger.warn(`Brokerage with access code ${accessCode} not found`);
      throw new BrokerageWithAccessCodeNotFoundException(accessCode);
    }

    return brokerage;
  }

  async findByIdWithRelations(brokerageId: string): Promise<Brokerage> {
    const brokerage = await this.brokerageRepository.findOne({
      where: { id: brokerageId },
      relations: [
        'agents',
        'agents.user',
        'brokers',
        'brokers.user',
        'supportingProfessionals',
        'supportingProfessionals.user',
      ],
    });

    if (!brokerage) {
      this.logger.error(`Brokerage ${brokerageId} not found in database`);
      throw new NotFoundException(`Brokerage with ID ${brokerageId} not found`);
    }

    return brokerage;
  }

  async regenerateAccessCode(brokerageId: string): Promise<Brokerage> {
    const brokerage = await this.findOne(brokerageId);
    brokerage.accessCode = await this.getUniqueAccessCode(brokerageId);

    const updated = await this.brokerageRepository.save(brokerage);
    this.logger.log(
      `Regenerated access code for brokerage: ${brokerage.name} - New code: ${updated.accessCode}`,
    );

    return updated;
  }

  private async getUniqueAccessCode(
    excludeBrokerageId?: string,
  ): Promise<string> {
    let accessCode = AccessCodeGenerator.generate();
    let isUnique = false;

    // Ensure the code is unique
    while (!isUnique) {
      const existing = await this.brokerageRepository.findOne({
        where: { accessCode },
      });

      if (!existing || existing.id === excludeBrokerageId) {
        isUnique = true;
      } else {
        accessCode = AccessCodeGenerator.generate();
      }
    }

    return accessCode;
  }
}
