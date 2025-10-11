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
import { BrokerProfile } from '../entities/broker-profile.entity';
import { BaseProfileController } from './base-profile.controller';
import { BrokerProfilesService } from '../services/broker-profiles.service';
import { CreateBrokerProfileDto } from '../dto/create-broker-profile.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { SimpleUserResponseDto } from '../dto/simple-user-response.dto';
import { Auth0User } from '../interfaces/auth0-user.interface';

interface AuthenticatedRequest extends Request {
  user: Auth0User;
}

@Controller('brokers')
@ApiTags('brokers')
export class BrokersController extends BaseProfileController {
  constructor(private readonly brokerProfilesService: BrokerProfilesService) {
    super();
  }

  @Get()
  @ApiOperation({
    summary: 'Get all brokers',
    description: 'Retrieves a list of all users who have broker profiles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Brokers retrieved successfully',
    type: [SimpleUserResponseDto],
  })
  async getAllBrokers(): Promise<Partial<User>[]> {
    try {
      return await this.brokerProfilesService.getAllBrokers();
    } catch (error) {
      this.handleError(error, 'retrieve brokers');
    }
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
}
