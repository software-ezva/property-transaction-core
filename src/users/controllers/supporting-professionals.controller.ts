import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
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
import { SupportingProfessionalProfile } from '../entities/supporting-professional-profile.entity';
import { BaseProfileController } from './base-profile.controller';
import { SupportingProfessionalsService } from '../services/supporting-professionals.service';
import { CreateSupportingProfessionalProfileDto } from '../dto/create-supporting-professional-profile.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { SimpleUserResponseDto } from '../dto/simple-user-response.dto';
import { Auth0User } from '../interfaces/auth0-user.interface';

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

  @Put(':id/brokerage/:brokerageId')
  @ApiOperation({
    summary: 'Assign supporting professional to brokerage',
    description:
      'Assigns a supporting professional to work with a specific brokerage.',
  })
  @ApiParam({
    name: 'id',
    description: 'Supporting professional profile ID',
    type: 'string',
  })
  @ApiParam({
    name: 'brokerageId',
    description: 'Brokerage ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Supporting professional assigned to brokerage successfully',
  })
  async assignToBrokerage(
    @Param('id') professionalId: string,
    @Param('brokerageId') brokerageId: string,
  ): Promise<SupportingProfessionalProfile> {
    try {
      return await this.supportingProfessionalsService.assignToBrokerage(
        professionalId,
        brokerageId,
      );
    } catch (error) {
      this.handleError(error, 'assign supporting professional to brokerage');
    }
  }

  @Delete(':id/brokerage/:brokerageId')
  @ApiOperation({
    summary: 'Remove supporting professional from brokerage',
    description:
      'Removes a supporting professional from working with a specific brokerage.',
  })
  @ApiParam({
    name: 'id',
    description: 'Supporting professional profile ID',
    type: 'string',
  })
  @ApiParam({
    name: 'brokerageId',
    description: 'Brokerage ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Supporting professional removed from brokerage successfully',
  })
  async removeFromBrokerage(
    @Param('id') professionalId: string,
    @Param('brokerageId') brokerageId: string,
  ): Promise<SupportingProfessionalProfile> {
    try {
      return await this.supportingProfessionalsService.removeFromBrokerage(
        professionalId,
        brokerageId,
      );
    } catch (error) {
      this.handleError(error, 'remove supporting professional from brokerage');
    }
  }
}
