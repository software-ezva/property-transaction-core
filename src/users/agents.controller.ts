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
import { CreateAgentProfileDto } from './dto/create-agent-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { SimpleUserResponseDto } from './dto/simple-user-response.dto';
import { Auth0User } from './interfaces/auth0-user.interface';

interface AuthenticatedRequest extends Request {
  user: Auth0User;
}

@Controller('agents')
@ApiTags('agents')
export class AgentsController extends BaseProfileController {
  constructor(profilesService: ProfilesService) {
    super(profilesService);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all agents',
    description:
      'Retrieves a list of all users who have real estate agent profiles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Agents retrieved successfully',
    type: [SimpleUserResponseDto],
  })
  async getAllAgents(): Promise<Partial<User>[]> {
    try {
      return await this.profilesService.getAllAgents();
    } catch (error) {
      this.handleError(error, 'retrieve agents');
    }
  }

  @Post('')
  @ApiOperation({
    summary: 'Assign agent profile to user',
    description:
      'Creates or updates a real estate agent profile for the authenticated user.',
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
  async assignAgentProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateAgentProfileDto,
  ): Promise<ProfileResponseDto> {
    try {
      this.validateAuthentication(req);
      return await this.profilesService.assignAgentProfile(req.user.sub, dto);
    } catch (error) {
      this.handleError(error, 'assign agent profile', req.user?.sub);
    }
  }
}
