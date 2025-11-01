import { Controller, Get, Post, Body, Req, Param, Put } from '@nestjs/common';
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
import { SupportingProfessionalProfile } from '../entities/supporting-professional-profile.entity';
import { BaseProfileController } from './base-profile.controller';
import { SupportingProfessionalsService } from '../services/supporting-professionals.service';
import { CreateSupportingProfessionalProfileDto } from '../dto/create-supporting-professional-profile.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { SimpleUserResponseDto } from '../dto/simple-user-response.dto';
import { Auth0User } from '../interfaces/auth0-user.interface';
import { JoinBrokerageWithCodeDto } from '../dto/join-brokerage-with-code.dto';

interface AuthenticatedRequest extends Request {
  user: Auth0User;
}

@Controller('supporting-professionals')
@ApiTags('supporting-professionals')
export class SupportingProfessionalsController extends BaseProfileController {
  constructor(
    private readonly supportingProfessionalsService: SupportingProfessionalsService,
  ) {
    super();
  }

  @Get()
  @ApiOperation({
    summary: 'Get all supporting professionals',
    description:
      'Retrieves a list of all users who have supporting professional profiles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Supporting professionals retrieved successfully',
    type: [SimpleUserResponseDto],
  })
  async getAllSupportingProfessionals(): Promise<Partial<User>[]> {
    try {
      return await this.supportingProfessionalsService.getAllSupportingProfessionals();
    } catch (error) {
      this.handleError(error, 'retrieve supporting professionals');
    }
  }

  @Post('')
  @ApiOperation({
    summary: 'Assign supporting professional profile to user',
    description:
      'Creates or updates a supporting professional profile for the authenticated user.',
  })
  @ApiBody({
    type: CreateSupportingProfessionalProfileDto,
    description:
      'Supporting professional profile data including professional type and e-signature information',
  })
  @ApiResponse({
    status: 200,
    description: 'Supporting professional profile assigned successfully',
    type: ProfileResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid supporting professional profile data provided',
  })
  async assignSupportingProfessionalProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateSupportingProfessionalProfileDto,
  ): Promise<ProfileResponseDto> {
    try {
      this.validateAuthentication(req);
      const profile =
        await this.supportingProfessionalsService.assignSupportingProfessionalProfile(
          req.user.sub,
          dto,
        );
      return { profile };
    } catch (error) {
      this.handleError(
        error,
        'assign supporting professional profile',
        req.user?.sub,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get supporting professional by ID',
    description:
      'Retrieves a specific supporting professional by their profile ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Supporting professional profile ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Supporting professional retrieved successfully',
  })
  async getSupportingProfessionalById(
    @Param('id') professionalId: string,
  ): Promise<SupportingProfessionalProfile | null> {
    try {
      return await this.supportingProfessionalsService.getSupportingProfessionalById(
        professionalId,
      );
    } catch (error) {
      this.handleError(error, 'retrieve supporting professional by ID');
    }
  }

  @Put('me/join-brokerage')
  @ApiOperation({
    summary: 'Join brokerage using access code',
    description:
      'Allows the authenticated supporting professional to join a brokerage using a 6-character access code (format: ABC123).',
  })
  @ApiBody({
    type: JoinBrokerageWithCodeDto,
    description: 'Access code to join the brokerage',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined the brokerage',
    type: SupportingProfessionalProfile,
  })
  @ApiBadRequestResponse({
    description: 'Invalid access code format or already associated',
  })
  @ApiNotFoundResponse({
    description: 'Supporting professional or brokerage not found',
  })
  async joinBrokerageWithCode(
    @Req() req: AuthenticatedRequest,
    @Body() dto: JoinBrokerageWithCodeDto,
  ): Promise<SupportingProfessionalProfile> {
    try {
      this.validateAuthentication(req);
      return await this.supportingProfessionalsService.joinBrokerageWithCode(
        req.user.sub,
        dto.accessCode,
      );
    } catch (error) {
      this.handleError(error, 'join brokerage with access code', req.user?.sub);
    }
  }
}
