import { Injectable, Logger } from '@nestjs/common';
import { SyncUserResponseDto } from './dto/sync-user-response.dto';
import { User } from './entities/user.entity';
import { Auth0User } from './interfaces/auth0-user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RealEstateAgentProfile } from './entities/real-estate-agent-profile.entity';
import { ClientProfile } from './entities/client-profile.entity';
import { Profile } from './entities/profile.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

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
      user = this.userRepository.create({
        auth0Id: auth0User.sub,
        email: auth0User.email,
        firstName: auth0User.given_name,
        lastName: auth0User.family_name,
        isActive: true,
      });

      user = await this.userRepository.save(user);
      // Load profile relation for new user (will be null initially)
      user =
        (await this.userRepository.findOne({
          where: { id: user.id },
          relations: ['profile'],
        })) || user;
    }

    return new SyncUserResponseDto(user, isNewUser);
  }

  // // ...existing code...
  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }

  // findAll() {
  //   return `This action returns all users`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
