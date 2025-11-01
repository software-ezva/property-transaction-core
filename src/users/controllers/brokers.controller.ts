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
import { BrokerProfile } from '../entities/broker-profile.entity';
import { BaseProfileController } from './base-profile.controller';
import { BrokerProfilesService } from '../services/broker-profiles.service';
import { CreateBrokerProfileDto } from '../dto/create-broker-profile.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { Auth0User } from '../interfaces/auth0-user.interface';
import { BrokerageDetailResponseDto } from '../dto/brokerage-detail-response.dto';
import { JoinBrokerageWithCodeDto } from '../dto/join-brokerage-with-code.dto';

interface AuthenticatedRequest extends Request {
  user: Auth0User;
}

@Controller('brokers')
@ApiTags('brokers')
export class BrokersController extends BaseProfileController {
  constructor(private readonly brokerProfilesService: BrokerProfilesService) {
    super();
  }

  @Post('')
  @ApiOperation({
    summary: 'Assign broker profile to user',
    description:
      'Creates or updates a broker profile for the authenticated user.',
  })
  @ApiBody({
    type: CreateBrokerProfileDto,
    description:
      'Broker profile data including license and brokerage information',
  })
  @ApiResponse({
    status: 200,
    description: 'Broker profile assigned successfully',
    type: ProfileResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid broker profile data provided',
  })
  async assignBrokerProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateBrokerProfileDto,
  ): Promise<ProfileResponseDto> {
    try {
      this.validateAuthentication(req);
      const profile = await this.brokerProfilesService.assignBrokerProfile(
        req.user.sub,
        dto,
      );
      return { profile };
    } catch (error) {
      this.handleError(error, 'assign broker profile', req.user?.sub);
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get broker by ID',
    description: 'Retrieves a specific broker by their profile ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Broker profile ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Broker retrieved successfully',
  })
  async getBrokerById(
    @Param('id') brokerId: string,
  ): Promise<BrokerProfile | null> {
    try {
      return await this.brokerProfilesService.getBrokerById(brokerId);
    } catch (error) {
      this.handleError(error, 'retrieve broker by ID');
    }
  }

  @Get('brokerage/:brokerageId')
  @ApiOperation({
    summary: 'Get brokers by brokerage',
    description: 'Retrieves all brokers working for a specific brokerage.',
  })
  @ApiParam({
    name: 'brokerageId',
    description: 'Brokerage ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Brokers retrieved successfully',
  })
  async getBrokersByBrokerage(
    @Param('brokerageId') brokerageId: string,
  ): Promise<BrokerProfile[]> {
    try {
      return await this.brokerProfilesService.getBrokersByBrokerage(
        brokerageId,
      );
    } catch (error) {
      this.handleError(error, 'retrieve brokers by brokerage');
    }
  }

  @Get('me/brokerage')
  @ApiOperation({
    summary: 'Get brokerage of authenticated broker',
    description:
      'Retrieves the complete brokerage information for the authenticated broker, including all agents, brokers, and supporting professionals with their name and email. Returns null if the broker is not assigned to any brokerage.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Brokerage details retrieved successfully or null if not assigned',
    type: BrokerageDetailResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Broker profile not found',
  })
  async getMyBrokerage(
    @Req() req: AuthenticatedRequest,
  ): Promise<BrokerageDetailResponseDto | null> {
    try {
      return await this.brokerProfilesService.getBrokerageByBroker(
        req.user.sub,
      );
    } catch (error) {
      this.handleError(error, 'retrieve my brokerage', req.user?.sub);
    }
  }

  @Put('me/join-brokerage')
  @ApiOperation({
    summary: 'Join brokerage using access code',
    description:
      'Allows the authenticated broker to join a brokerage using a 6-character access code (format: ABC123).',
  })
  @ApiBody({
    type: JoinBrokerageWithCodeDto,
    description: 'Access code to join the brokerage',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined the brokerage',
    type: BrokerProfile,
  })
  @ApiBadRequestResponse({
    description: 'Invalid access code format',
  })
  @ApiNotFoundResponse({
    description: 'Broker or brokerage not found',
  })
  async joinBrokerageWithCode(
    @Req() req: AuthenticatedRequest,
    @Body() dto: JoinBrokerageWithCodeDto,
  ): Promise<BrokerProfile> {
    try {
      return await this.brokerProfilesService.joinBrokerageWithCode(
        req.user.sub,
        dto.accessCode,
      );
    } catch (error) {
      this.handleError(error, 'join brokerage with access code', req.user?.sub);
    }
  }
}
