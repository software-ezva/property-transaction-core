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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Controller('properties')
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
  })
  @ApiBadRequestResponse({
    description: 'Invalid property data provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during property creation',
  })
  create(@Body() createPropertyDto: CreatePropertyDto) {
    try {
      const result = this.propertiesService.create(createPropertyDto);
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
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during properties retrieval',
  })
  findAll() {
    try {
      const result = this.propertiesService.findAll();
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
  findOne(@Param('id') id: string) {
    try {
      const propertyId = +id;
      if (isNaN(propertyId)) {
        throw new HttpException('Invalid property ID', HttpStatus.BAD_REQUEST);
      }

      const result = this.propertiesService.findOne(propertyId);
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
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    try {
      const propertyId = +id;
      if (isNaN(propertyId)) {
        throw new HttpException('Invalid property ID', HttpStatus.BAD_REQUEST);
      }

      const result = this.propertiesService.update(
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
  remove(@Param('id') id: string) {
    try {
      const propertyId = +id;
      if (isNaN(propertyId)) {
        throw new HttpException('Invalid property ID', HttpStatus.BAD_REQUEST);
      }

      const result = this.propertiesService.remove(propertyId);
      this.logger.log(`Property deleted: ${id}`); // Solo para operaciones críticas como DELETE
      return result;
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
