import { Injectable, Logger } from '@nestjs/common';
import { SyncUserResponseDto } from '../dto/sync-user-response.dto';
import { User } from '../entities/user.entity';
import { Auth0User } from '../interfaces/auth0-user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { UserIsNotRealEstateAgentException } from '../exceptions';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Sync user from Auth0
  async syncUserFromAuth0(auth0User: Auth0User): Promise<SyncUserResponseDto> {
    // Find existing user by auth0Id
    let user = await this.userRepository.findOne({
      where: { auth0Id: auth0User.sub },
      relations: ['profile'],
    });

    let isNewUser = false;

    if (user) {
      // User exists, update if there are changes
      const needsUpdate =
        user.email !== auth0User.email ||
        user.firstName !== auth0User.given_name ||
        user.lastName !== auth0User.family_name;

      if (needsUpdate) {
        user.email = auth0User.email;
        user.firstName = auth0User.given_name || user.firstName;
        user.lastName = auth0User.family_name || user.lastName;

        user = await this.userRepository.save(user);
        // Reload user with profile relation after update
        user =
          (await this.userRepository.findOne({
            where: { id: user.id },
            relations: ['profile'],
          })) || user;
      }
    } else {
      // User doesn't exist, create new one
      isNewUser = true;
      user = await this.create(
        auth0User.sub,
        auth0User.email,
        auth0User.given_name || '',
        auth0User.family_name || '',
        true,
      );

      user =
        (await this.userRepository.findOne({
          where: { id: user.id },
          relations: ['profile'],
        })) || user;
    }

    return new SyncUserResponseDto(user, isNewUser);
  }

  async create(
    auth0Id: string,
    email: string,
    firstName: string,
    lastName: string,
    isActive: boolean = true,
  ): Promise<User> {
    const user = this.userRepository.create({
      auth0Id,
      email,
      firstName,
      lastName,
      isActive,
    });
    this.logger.log(`Creating user with Auth0 ID: ${auth0Id}`);
    return await this.userRepository.save(user);
  }

  async getUserByAuth0Id(auth0Id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { auth0Id },
      relations: ['profile'],
    });

    if (!user) {
      this.logger.warn(`User not found with auth0Id: ${auth0Id}`);
      throw new UserNotFoundException();
    }
    return user;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!user) {
      this.logger.warn(`User not found with ID: ${id}`);
      throw new UserNotFoundException();
    }
    return user;
  }

  async verifyUserIsRealEstateAgent(auth0Id: string): Promise<boolean> {
    const agent = await this.getUserByAuth0Id(auth0Id);
    if (!agent.isRealEstateAgent()) {
      this.logger.warn(`User with ID ${auth0Id} is not a real estate agent`);
      throw new UserIsNotRealEstateAgentException();
    }
    return true;
  }
}
