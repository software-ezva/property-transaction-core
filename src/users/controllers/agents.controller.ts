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
import { AgentProfilesService } from '../services/agent-profiles.service';
import { CreateAgentProfileDto } from '../dto/create-agent-profile.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { SimpleUserResponseDto } from '../dto/simple-user-response.dto';
import { Auth0User } from '../interfaces/auth0-user.interface';
import { JoinBrokerageWithCodeDto } from '../dto/join-brokerage-with-code.dto';

interface AuthenticatedRequest extends Request {
  user: Auth0User;
}

@Controller('agents')
@ApiTags('agents')
export class AgentsController extends BaseProfileController {
  constructor(private readonly agentProfilesService: AgentProfilesService) {
    super();
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
      return await this.agentProfilesService.getAllAgents();
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
      const profile = await this.agentProfilesService.assignAgentProfile(
        req.user.sub,
        dto,
      );
      return { profile };
    } catch (error) {
      this.handleError(error, 'assign agent profile', req.user?.sub);
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get agent by ID',
    description: 'Retrieves a specific real estate agent by their profile ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Agent profile ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Agent retrieved successfully',
  })
  async getAgentById(
    @Param('id') agentId: string,
  ): Promise<RealEstateAgentProfile | null> {
    try {
      return await this.agentProfilesService.getAgentById(agentId);
    } catch (error) {
      this.handleError(error, 'retrieve agent by ID');
    }
  }

  @Get('brokerage/:brokerageId')
  @ApiOperation({
    summary: 'Get agents by brokerage',
    description: 'Retrieves all agents working for a specific brokerage.',
  })
  @ApiParam({
    name: 'brokerageId',
    description: 'Brokerage ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Agents retrieved successfully',
  })
  async getAgentsByBrokerage(
    @Param('brokerageId') brokerageId: string,
  ): Promise<RealEstateAgentProfile[]> {
    try {
      return await this.agentProfilesService.getAgentsByBrokerage(brokerageId);
    } catch (error) {
      this.handleError(error, 'retrieve agents by brokerage');
    }
  }

  @Put('me/join-brokerage')
  @ApiOperation({
    summary: 'Join brokerage using access code',
    description:
      'Allows the authenticated agent to join a brokerage using a 6-character access code (format: ABC123).',
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
