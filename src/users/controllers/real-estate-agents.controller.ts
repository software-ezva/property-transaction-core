import { Controller, Get, Post, Put, Body, Req, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiParam,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '../entities/user.entity';
import { RealEstateAgentProfile } from '../entities/real-estate-agent-profile.entity';
import { BaseProfileController } from './base-profile.controller';
import { RealEstateAgentProfilesService } from '../services/real-estate-agent-profiles.service';
import { CreateRealEstateAgentProfileDto } from '../dto/create-real-estate-agent-profile.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { SimpleUserResponseDto } from '../dto/simple-user-response.dto';
import { Auth0User } from '../interfaces/auth0-user.interface';
import { JoinBrokerageWithCodeDto } from '../dto/join-brokerage-with-code.dto';

interface AuthenticatedRequest extends Request {
  user: Auth0User;
}

@Controller('real-estate-agents')
@ApiTags('real-estate-agents')
export class RealEstateAgentsController extends BaseProfileController {
  constructor(
    private readonly agentProfilesService: RealEstateAgentProfilesService,
  ) {
    super();
  }

  @Get()
  @ApiOperation({
    summary: 'Get all real estate agents',
    description:
      'Retrieves a list of all users who have real estate agent profiles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Real estate agents retrieved successfully',
    type: [SimpleUserResponseDto],
  })
  async getAllRealEstateAgents(): Promise<Partial<User>[]> {
    try {
      return await this.agentProfilesService.getAllRealEstateAgents();
    } catch (error) {
      this.handleError(error, 'retrieve real estate agents');
    }
  }

  @Post('')
  @ApiOperation({
    summary: 'Assign real estate agent profile to user',
    description:
      'Creates or updates a real estate agent profile for the authenticated user.',
  })
  @ApiBody({
    type: CreateRealEstateAgentProfileDto,
    description:
      'Agent profile data including license and e-signature information',
  })
  @ApiResponse({
    status: 200,
    description: 'Real estate agent profile assigned successfully',
    type: ProfileResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid agent profile data provided',
  })
  async assignRealEstateAgentProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateRealEstateAgentProfileDto,
  ): Promise<ProfileResponseDto> {
    try {
      const profile =
        await this.agentProfilesService.assignRealEstateAgentProfile(
          req.user.sub,
          dto,
        );
      return { profile };
    } catch (error) {
      this.handleError(
        error,
        'assign real estate agent profile',
        req.user?.sub,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get real estate agent by ID',
    description: 'Retrieves a specific real estate agent by their profile ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Agent profile ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Real estate agent retrieved successfully',
  })
  async getRealEstateAgentById(
    @Param('id') agentId: string,
  ): Promise<RealEstateAgentProfile | null> {
    try {
      return await this.agentProfilesService.getRealEstateAgentById(agentId);
    } catch (error) {
      this.handleError(error, 'retrieve real estate agent by ID');
    }
  }

  @Put('me/join-brokerage')
  @ApiOperation({
    summary: 'Join brokerage using access code',
    description:
      'Allows the authenticated real estate agent to join a brokerage using a 6-character access code (format: ABC123).',
  })
  @ApiBody({
    type: JoinBrokerageWithCodeDto,
    description: 'Access code to join the brokerage',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined the brokerage',
    type: RealEstateAgentProfile,
  })
  @ApiBadRequestResponse({
    description: 'Invalid access code format',
  })
  @ApiNotFoundResponse({
    description: 'Agent or brokerage not found',
  })
  async joinBrokerageWithCode(
    @Req() req: AuthenticatedRequest,
    @Body() dto: JoinBrokerageWithCodeDto,
  ): Promise<RealEstateAgentProfile> {
    try {
      this.validateAuthentication(req);
      return await this.agentProfilesService.joinBrokerageWithCode(
        req.user.sub,
        dto.accessCode,
      );
    } catch (error) {
      this.handleError(error, 'join brokerage with access code', req.user?.sub);
    }
  }
}
