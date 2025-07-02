import { Injectable, Logger } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createPropertyDto: CreatePropertyDto) {
    // TODO: Implement actual property creation logic
    return 'This action adds a new property';
  }

  findAll() {
    // TODO: Implement actual property retrieval logic
    return `This action returns all properties`;
  }

  findOne(id: number) {
    // TODO: Implement actual property retrieval by ID logic
    return `This action returns a #${id} property`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updatePropertyDto: UpdatePropertyDto) {
    // TODO: Implement actual property update logic with updatePropertyDto
    return `This action updates a #${id} property`;
  }

  remove(id: number) {
    this.logger.log(`Removing property with ID: ${id}`);
    // TODO: Implement actual property removal logic
    return `This action removes a #${id} property`;
  }
}
