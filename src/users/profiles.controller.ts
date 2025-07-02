import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ProfilesService } from '../users/profiles.service';
import { CreateAgentProfileDto } from './dto/create-agent-profile.dto';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { Auth0User } from './interfaces/auth0-user.interface';

interface AuthenticatedRequest extends Request {
  user: Auth0User;
}

@Controller('profiles')
@ApiTags('profiles')
export class ProfilesController {
  private readonly logger = new Logger(ProfilesController.name);

  constructor(private readonly profilesService: ProfilesService) {}

  @Post('agent')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Assign agent profile to user',
    description:
      'Creates or updates a real estate agent profile for the authenticated user with license information and e-signature details.',
  })
  @ApiBody({
    type: CreateAgentProfileDto,
    description:
      'Agent profile data including license and e-signature information',
  })
  @ApiResponse({
    status: 200,
    description: 'Agent profile assigned successfully',
    type: ProfileResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid agent profile data provided',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated or authorization failed',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during profile assignment',
  })
  async assignAgentProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateAgentProfileDto,
  ): Promise<ProfileResponseDto> {
    try {
      if (!req.user) {
        this.logger.warn('User not authenticated in request');
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const result = await this.profilesService.assignAgentProfile(
        req.user.sub,
        dto,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to assign agent profile for user: ${req.user?.sub}`,
        error instanceof Error ? error.stack : String(error),
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during profile assignment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('client')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Assign client profile to user',
    description:
      'Creates or updates a client profile for the authenticated user with personal and contact information.',
  })
  @ApiBody({
    type: CreateClientProfileDto,
    description: 'Client profile data including personal information',
  })
  @ApiResponse({
    status: 200,
    description: 'Client profile assigned successfully',
    type: ProfileResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid client profile data provided',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated or authorization failed',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during profile assignment',
  })
  async assignClientProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateClientProfileDto,
  ): Promise<ProfileResponseDto> {
    try {
      if (!req.user) {
        this.logger.warn('User not authenticated in request');
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const result = await this.profilesService.assignClientProfile(
        req.user.sub,
        dto,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to assign client profile for user: ${req.user?.sub}`,
        error instanceof Error ? error.stack : String(error),
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during profile assignment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
