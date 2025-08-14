import {
  Controller,
  Post,
  Body,
  Req,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from '../services/users.service';
import { Auth0User } from '../interfaces/auth0-user.interface';
import { SyncUserResponseDto } from '../dto/sync-user-response.dto';
import { SyncUserRequestDto } from '../dto/sync-user-request.dto';

interface AuthenticatedRequest extends Request {
  user: Auth0User;
}

@Controller('users')
@ApiTags('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  @ApiOperation({
    summary: 'Sync user from Auth0',
    description:
      'Creates a new user or updates an existing one based on the provided user data from Auth0. The JWT token is used for authentication while user data is sent in the request body.',
  })
  @ApiBody({
    type: SyncUserRequestDto,
    description: 'User data from Auth0 to synchronize',
  })
  @ApiResponse({
    status: 200,
    description: 'User synchronized successfully with profile information',
    type: SyncUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid user data provided or user not authenticated',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during user synchronization',
  })
  async syncUser(
    @Req() req: AuthenticatedRequest,
    @Body() userData: SyncUserRequestDto,
  ): Promise<SyncUserResponseDto> {
    try {
      if (!req.user) {
        this.logger.warn('User not authenticated in request');
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Combine JWT data with body data
      const auth0User: Auth0User = {
        sub: userData.sub || req.user.sub,
        email: userData.email,
        name: userData.name,
        given_name: userData.firstName,
        family_name: userData.lastName,
      };

      const result = await this.usersService.syncUserFromAuth0(auth0User);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to sync user with email: ${userData.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during user synchronization',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
