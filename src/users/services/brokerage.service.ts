import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brokerage } from '../entities/brokerage.entity';
import { CreateBrokerageDto } from '../dto/create-brokerage.dto';
import { UpdateBrokerageDto } from '../dto/update-brokerage.dto';

@Injectable()
export class BrokerageService {
  private readonly logger = new Logger(BrokerageService.name);

  constructor(
    @InjectRepository(Brokerage)
    private brokerageRepository: Repository<Brokerage>,
  ) {}

  async create(createBrokerageDto: CreateBrokerageDto): Promise<Brokerage> {
    try {
      const brokerage = this.brokerageRepository.create(createBrokerageDto);
      const savedBrokerage = await this.brokerageRepository.save(brokerage);
      this.logger.log(`Created brokerage: ${savedBrokerage.name}`);
      return savedBrokerage;
    } catch (error) {
      this.logger.error(
        `Failed to create brokerage: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async findAll(): Promise<Brokerage[]> {
    return await this.brokerageRepository.find({
      relations: ['agents'],
    });
  }

  async findOne(id: string): Promise<Brokerage> {
    const brokerage = await this.brokerageRepository.findOne({
      where: { id },
    });

    if (!brokerage) {
      throw new NotFoundException(`Brokerage with ID ${id} not found`);
    }

    return brokerage;
  }

  async update(
    id: string,
    updateBrokerageDto: UpdateBrokerageDto,
  ): Promise<Brokerage> {
    const brokerage = await this.findOne(id);

    Object.assign(brokerage, updateBrokerageDto);

    const updatedBrokerage = await this.brokerageRepository.save(brokerage);
    this.logger.log(`Updated brokerage: ${updatedBrokerage.name}`);

    return updatedBrokerage;
  }

  async remove(id: string): Promise<void> {
    const brokerage = await this.findOne(id);
    await this.brokerageRepository.remove(brokerage);
    this.logger.log(`Removed brokerage: ${brokerage.name}`);
  }
}
