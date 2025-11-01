import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { BrokerageService } from '../services/brokerage.service';
import { CreateBrokerageDto } from '../dto/create-brokerage.dto';
import { UpdateBrokerageDto } from '../dto/update-brokerage.dto';
import { BrokerageResponseDto } from '../dto/brokerage-response.dto';
import { BrokerageListResponseDto } from '../dto/brokerage-list-response.dto';
import { Brokerage } from '../entities/brokerage.entity';
import { GlobalAuthGuard } from '../../authz/auth.guard';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@ApiTags('brokerages')
@ApiBearerAuth()
@UseGuards(GlobalAuthGuard)
@Controller('brokerages')
export class BrokerageController {
  constructor(private readonly brokerageService: BrokerageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new brokerage' })
  @ApiResponse({
    status: 201,
    description: 'Brokerage created successfully.',
    type: BrokerageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({
    status: 403,
    description: 'Only brokers can create brokerages.',
  })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createBrokerageDto: CreateBrokerageDto,
  ): Promise<Brokerage> {
    return this.brokerageService.create(req.user.sub, createBrokerageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all brokerages' })
  @ApiResponse({
    status: 200,
    description: 'List of all brokerages (without accessCode and createdAt).',
    type: [BrokerageListResponseDto],
  })
  findAll(@Req() req: AuthenticatedRequest): Promise<Brokerage[]> {
    return this.brokerageService.findAll(req.user.sub);
  }

  @Get(':brokerageId')
  @ApiOperation({ summary: 'Get a brokerage by ID' })
  @ApiResponse({
    status: 200,
    description: 'Brokerage found.',
    type: BrokerageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Brokerage not found.' })
  findOne(@Param('brokerageId') id: string): Promise<Brokerage> {
    return this.brokerageService.findOne(id);
  }

  @Patch(':brokerageId')
  @ApiOperation({ summary: 'Update a brokerage' })
  @ApiResponse({
    status: 200,
    description: 'Brokerage updated successfully.',
    type: BrokerageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Brokerage not found.' })
  update(
    @Param('brokerageId') brokerageId: string,
    @Body() updateBrokerageDto: UpdateBrokerageDto,
  ): Promise<Brokerage> {
    return this.brokerageService.update(brokerageId, updateBrokerageDto);
  }

  @Delete(':brokerageId')
  @ApiOperation({ summary: 'Delete a brokerage' })
  @ApiResponse({ status: 200, description: 'Brokerage deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Brokerage not found.' })
  remove(@Param('brokerageId') brokerageId: string): Promise<void> {
    return this.brokerageService.remove(brokerageId);
  }

  @Post(':brokerageId/regenerate-access-code')
  @ApiOperation({
    summary: 'Regenerate brokerage access code',
    description:
      'Generates a new access code for the brokerage. The old code will no longer work.',
  })
  @ApiParam({
    name: 'brokerageId',
    description: 'Brokerage ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Access code regenerated successfully',
    type: BrokerageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Brokerage not found.' })
  regenerateAccessCode(@Param('brokerageId') id: string): Promise<Brokerage> {
    return this.brokerageService.regenerateAccessCode(id);
  }
}
