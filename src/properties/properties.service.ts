import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyResponseDto } from './dto/property-response.dto';
import { Property } from './entities/property.entity';
import { PropertyNotFoundException } from '../common/exceptions';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  /**
   * Maps a Property entity to PropertyResponseDto
   */
  private mapToResponseDto(property: Property): PropertyResponseDto {
    return {
      id: property.id,
      address: property.address,
      price: property.price,
      size: property.size,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      description: property.description,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }

  async create(
    createPropertyDto: CreatePropertyDto,
  ): Promise<PropertyResponseDto> {
    this.logger.log('Creating new property');

    try {
      const property = this.propertyRepository.create(createPropertyDto);
      const savedProperty = await this.propertyRepository.save(property);

      this.logger.log(`Property created with ID: ${savedProperty.id}`);
      return this.mapToResponseDto(savedProperty);
    } catch (error) {
      this.logger.error(
        'Error creating property',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async findAll(): Promise<PropertyResponseDto[]> {
    this.logger.log('Retrieving all properties');

    try {
      const properties = await this.propertyRepository.find({
        order: { createdAt: 'DESC' },
      });

      this.logger.log(`Found ${properties.length} properties`);
      return properties.map((property) => this.mapToResponseDto(property));
    } catch (error) {
      this.logger.error(
        'Error retrieving properties',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async findOne(id: number): Promise<PropertyResponseDto> {
    this.logger.log(`Retrieving property with ID: ${id}`);

    try {
      const property = await this.propertyRepository.findOne({
        where: { id },
      });

      if (!property) {
        throw new PropertyNotFoundException(id);
      }

      this.logger.log(`Found property: ${property.address}`);
      return this.mapToResponseDto(property);
    } catch (error) {
      this.logger.error(
        `Error retrieving property with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async update(
    id: number,
    updatePropertyDto: UpdatePropertyDto,
  ): Promise<PropertyResponseDto> {
    this.logger.log(`Updating property with ID: ${id}`);

    try {
      const property = await this.propertyRepository.findOne({
        where: { id },
      });

      if (!property) {
        throw new PropertyNotFoundException(id);
      }

      Object.assign(property, updatePropertyDto);
      property.updatedAt = new Date();

      const updatedProperty = await this.propertyRepository.save(property);

      this.logger.log(`Property updated: ${updatedProperty.address}`);
      return this.mapToResponseDto(updatedProperty);
    } catch (error) {
      this.logger.error(
        `Error updating property with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing property with ID: ${id}`);

    try {
      const property = await this.propertyRepository.findOne({
        where: { id },
      });

      if (!property) {
        throw new PropertyNotFoundException(id);
      }

      await this.propertyRepository.remove(property);

      this.logger.log(`Property removed: ${property.address}`);
    } catch (error) {
      this.logger.error(
        `Error removing property with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
