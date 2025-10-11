import { Controller, Get, Post, Body, Req, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '../entities/user.entity';
import { ClientProfile } from '../entities/client-profile.entity';
import { BaseProfileController } from './base-profile.controller';
import { ClientProfilesService } from '../services/client-profiles.service';
import { CreateClientProfileDto } from '../dto/create-client-profile.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { SimpleUserResponseDto } from '../dto/simple-user-response.dto';
import { Auth0User } from '../interfaces/auth0-user.interface';

interface AuthenticatedRequest extends Request {
  user: Auth0User;
}

@Controller('clients')
@ApiTags('clients')
export class ClientsController extends BaseProfileController {
  constructor(private readonly clientProfilesService: ClientProfilesService) {
    super();
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
      return await this.clientProfilesService.getAllClients();
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
      const profile = await this.clientProfilesService.assignClientProfile(
        req.user.sub,
        dto,
      );
      return { profile };
    } catch (error) {
      this.handleError(error, 'assign client profile', req.user?.sub);
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get client by ID',
    description: 'Retrieves a specific client by their profile ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Client profile ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Client retrieved successfully',
  })
  async getClientById(
    @Param('id') clientId: string,
  ): Promise<ClientProfile | null> {
    try {
      return await this.clientProfilesService.getClientById(clientId);
    } catch (error) {
      this.handleError(error, 'retrieve client by ID');
    }
  }
}
