import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyResponseDto } from './dto/property-response.dto';

@Controller('properties')
@ApiTags('properties')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'User not authenticated or authorization failed',
})
@ApiTags('properties')
export class PropertiesController {
  private readonly logger = new Logger(PropertiesController.name);

  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new property',
    description: 'Creates a new property with the provided information.',
  })
  @ApiBody({
    type: CreatePropertyDto,
    description: 'Property information to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Property created successfully',
    type: PropertyResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid property data provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during property creation',
  })
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
  ): Promise<PropertyResponseDto> {
    try {
      const result = await this.propertiesService.create(createPropertyDto);
      return result;
    } catch (error) {
      this.logger.error(
        'Failed to create property',
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        'Internal server error during property creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all properties',
    description: 'Retrieves a list of all properties in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Properties retrieved successfully',
    type: [PropertyResponseDto],
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during properties retrieval',
  })
  async findAll(): Promise<PropertyResponseDto[]> {
    try {
      const result = await this.propertiesService.findAll();
      return result;
    } catch (error) {
      this.logger.error(
        'Failed to retrieve properties',
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        'Internal server error during properties retrieval',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get property by ID',
    description: 'Retrieves a specific property by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Property ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Property retrieved successfully',
    type: PropertyResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Property not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid property ID provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during property retrieval',
  })
  async findOne(@Param('id') id: string): Promise<PropertyResponseDto> {
    try {
      const propertyId = +id;
      if (isNaN(propertyId)) {
        throw new HttpException('Invalid property ID', HttpStatus.BAD_REQUEST);
      }

      const result = await this.propertiesService.findOne(propertyId);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve property with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during property retrieval',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update property by ID',
    description: 'Updates a specific property with the provided information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Property ID',
    type: 'number',
  })
  @ApiBody({
    type: UpdatePropertyDto,
    description: 'Property information to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Property updated successfully',
    type: PropertyResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Property not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid property ID or data provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during property update',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ): Promise<PropertyResponseDto> {
    try {
      const propertyId = +id;
      if (isNaN(propertyId)) {
        throw new HttpException('Invalid property ID', HttpStatus.BAD_REQUEST);
      }

      const result = await this.propertiesService.update(
        propertyId,
        updatePropertyDto,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to update property with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during property update',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete property by ID',
    description: 'Deletes a specific property from the system.',
  })
  @ApiParam({
    name: 'id',
    description: 'Property ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Property deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Property not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid property ID provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during property deletion',
  })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      const propertyId = +id;
      if (isNaN(propertyId)) {
        throw new HttpException('Invalid property ID', HttpStatus.BAD_REQUEST);
      }

      await this.propertiesService.remove(propertyId);
      this.logger.log(`Property deleted: ${id}`); // Solo para operaciones críticas como DELETE
    } catch (error) {
      this.logger.error(
        `Failed to delete property with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during property deletion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
