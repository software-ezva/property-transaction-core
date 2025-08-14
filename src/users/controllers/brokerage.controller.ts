import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { BrokerageService } from '../services/brokerage.service';
import { CreateBrokerageDto } from '../dto/create-brokerage.dto';
import { UpdateBrokerageDto } from '../dto/update-brokerage.dto';
import { BrokerageResponseDto } from '../dto/brokerage-response.dto';
import { Brokerage } from '../entities/brokerage.entity';
import { GlobalAuthGuard } from '../../authz/auth.guard';

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
  create(@Body() createBrokerageDto: CreateBrokerageDto): Promise<Brokerage> {
    return this.brokerageService.create(createBrokerageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all brokerages' })
  @ApiResponse({
    status: 200,
    description: 'List of all brokerages.',
    type: [BrokerageResponseDto],
  })
  findAll(): Promise<Brokerage[]> {
    return this.brokerageService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a brokerage by ID' })
  @ApiResponse({
    status: 200,
    description: 'Brokerage found.',
    type: BrokerageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Brokerage not found.' })
  findOne(@Param('id') id: string): Promise<Brokerage> {
    return this.brokerageService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a brokerage' })
  @ApiResponse({
    status: 200,
    description: 'Brokerage updated successfully.',
    type: BrokerageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Brokerage not found.' })
  update(
    @Param('id') id: string,
    @Body() updateBrokerageDto: UpdateBrokerageDto,
  ): Promise<Brokerage> {
    return this.brokerageService.update(id, updateBrokerageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a brokerage' })
  @ApiResponse({ status: 200, description: 'Brokerage deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Brokerage not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.brokerageService.remove(id);
  }
}
