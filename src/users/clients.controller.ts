import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { User } from './entities/user.entity';
import { BaseProfileController } from './base-profile.controller';
import { ProfilesService } from './profiles.service';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { SimpleUserResponseDto } from './dto/simple-user-response.dto';
import { Auth0User } from './interfaces/auth0-user.interface';

interface AuthenticatedRequest extends Request {
  user: Auth0User;
}

@Controller('clients')
@ApiTags('clients')
export class ClientsController extends BaseProfileController {
  constructor(profilesService: ProfilesService) {
    super(profilesService);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all clients',
    description: 'Retrieves a list of all users who have client profiles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Clients retrieved successfully',
    type: [SimpleUserResponseDto],
  })
  async getAllClients(): Promise<Partial<User>[]> {
    try {
      return await this.profilesService.getAllClients();
    } catch (error) {
      this.handleError(error, 'retrieve clients');
    }
  }

  @Post('')
  @ApiOperation({
    summary: 'Assign client profile to user',
    description:
      'Creates or updates a client profile for the authenticated user.',
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
  async assignClientProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateClientProfileDto,
  ): Promise<ProfileResponseDto> {
    try {
      this.validateAuthentication(req);
      return await this.profilesService.assignClientProfile(req.user.sub, dto);
    } catch (error) {
      this.handleError(error, 'assign client profile', req.user?.sub);
    }
  }
}
