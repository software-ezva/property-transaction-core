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
import { TransactionCoordinatorAgentProfile } from '../entities/transaction-coordinator-agent-profile.entity';
import { BaseProfileController } from './base-profile.controller';
import { TransactionCoordinatorAgentProfilesService } from '../services/transaction-coordinator-agent-profiles.service';
import { CreateTransactionCoordinatorAgentProfileDto } from '../dto/create-transaction-coordinator-agent-profile.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { SimpleUserResponseDto } from '../dto/simple-user-response.dto';
import { Auth0User } from '../interfaces/auth0-user.interface';
import { JoinBrokerageWithCodeDto } from '../dto/join-brokerage-with-code.dto';

interface AuthenticatedRequest extends Request {
  user: Auth0User;
}

@Controller('transaction-coordinators-agents')
@ApiTags('transaction-coordinators-agents')
export class AgentsController extends BaseProfileController {
  constructor(
    private readonly agentProfilesService: TransactionCoordinatorAgentProfilesService,
  ) {
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
  async getAllTransactionCoordinatorsAgents(): Promise<Partial<User>[]> {
    try {
      return await this.agentProfilesService.getAllTransactionCoordinatorsAgents();
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
    type: CreateTransactionCoordinatorAgentProfileDto,
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
  async assignTransactionCoordinatorAgentProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateTransactionCoordinatorAgentProfileDto,
  ): Promise<ProfileResponseDto> {
    try {
      const profile =
        await this.agentProfilesService.assignTransactionCoordinatorAgentProfile(
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
  async getTransactionCoordinatorAgentById(
    @Param('id') agentId: string,
  ): Promise<TransactionCoordinatorAgentProfile | null> {
    try {
      return await this.agentProfilesService.getTransactionCoordinatorAgentById(
        agentId,
      );
    } catch (error) {
      this.handleError(error, 'retrieve agent by ID');
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
    type: TransactionCoordinatorAgentProfile,
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
  ): Promise<TransactionCoordinatorAgentProfile> {
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
