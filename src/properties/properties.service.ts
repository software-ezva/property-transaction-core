import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
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

  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    try {
      let property = this.propertyRepository.create(createPropertyDto);
      property = await this.propertyRepository.save(property);
      this.logger.log(`Property created with ID: ${property.id}`);
      return property;
    } catch (error) {
      this.logger.error(
        'Error creating property',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async findAll(): Promise<Property[]> {
    try {
      const properties = await this.propertyRepository.find({
        order: { createdAt: 'DESC' },
      });

      this.logger.log(`Found ${properties.length} properties`);
      return properties;
    } catch (error) {
      this.logger.error(
        'Error retrieving properties',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async findOne(id: string): Promise<Property> {
    try {
      const property = await this.propertyRepository.findOne({
        where: { id },
      });

      if (!property) {
        throw new PropertyNotFoundException(id);
      }

      this.logger.log(`Found property: ${property.address}`);
      return property;
    } catch (error) {
      this.logger.error(
        `Error retrieving property with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
  ): Promise<Property> {
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
      return property;
    } catch (error) {
      this.logger.error(
        `Error updating property with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
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
