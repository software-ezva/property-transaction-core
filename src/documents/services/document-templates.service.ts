import { Injectable, Logger } from '@nestjs/common';
import { DocumentTemplate } from '../entities/document-template.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentCategory } from 'src/common/enums';
import { UsersService } from '../../users/services/users.service';
import { StorageService } from './storage.service';
import { CreateDocumentTemplateDto } from '../dto/create-document-template.dto';
import { DocumentTemplateNotFoundException } from '../expections/document-template-not-found.exception';
import { DocumentFile } from '../interfaces/document-file.interface';

@Injectable()
export class DocumentTemplatesService {
  private readonly logger = new Logger(DocumentTemplatesService.name);

  constructor(
    @InjectRepository(DocumentTemplate)
    private documentTemplateRepository: Repository<DocumentTemplate>,
    private readonly userService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  async create(
    createDocumentTemplateDto: CreateDocumentTemplateDto,
    file: DocumentFile,
    userId: string,
  ): Promise<{ template: DocumentTemplate; secureUrl: string }> {
    await this.userService.verifyUserIsRealEstateAgent(userId);

    const filePath = await this.storageService.storageTemplateDocument(
      file,
      createDocumentTemplateDto.category,
      createDocumentTemplateDto.title,
    );
    const documentTemplate = await this.uploadTemplateDocument(
      createDocumentTemplateDto.title,
      filePath,
      createDocumentTemplateDto.category,
    );

    const secureUrl = await this.storageService.generateSecureUrl(
      documentTemplate.filePath,
      1, // 1 hour expiration
    );

    this.logger.log(
      `Document template created successfully with ID: ${documentTemplate.documentTemplateId}`,
    );

    return { template: documentTemplate, secureUrl };
  }

  async findAll(userId: string): Promise<DocumentTemplate[]> {
    await this.userService.verifyUserIsRealEstateAgent(userId);

    const templates = await this.documentTemplateRepository.find({
      order: { createdAt: 'DESC' },
    });

    this.logger.log(
      `Retrieved ${templates.length} document templates for user: ${userId}`,
    );
    return templates;
  }

  async findOne(
    uuid: string,
    userId: string,
  ): Promise<{ template: DocumentTemplate; secureUrl: string }> {
    await this.userService.verifyUserIsRealEstateAgent(userId);

    const template = await this.getDocumentTemplate(uuid);

    const secureUrl = await this.storageService.generateSecureUrl(
      template.filePath,
      1,
    );

    return { template, secureUrl };
  }

  async remove(uuid: string, userId: string): Promise<void> {
    await this.userService.verifyUserIsRealEstateAgent(userId);

    const { template } = await this.findOne(uuid, userId);

    // Delete file from storage
    await this.storageService.deleteFile(template.filePath);

    // Delete template from database
    await this.documentTemplateRepository.remove(template);

    this.logger.log(
      `Document template ${uuid} deleted successfully by user: ${userId}`,
    );
  }

  async uploadTemplateDocument(
    templateName: string,
    filePath: string,
    category: DocumentCategory,
  ): Promise<DocumentTemplate> {
    const newTemplate = this.documentTemplateRepository.create({
      category: category,
      filePath: filePath,
      title: templateName,
    });
    return this.documentTemplateRepository.save(newTemplate);
  }

  async getDocumentTemplate(
    documentTemplateId: string,
  ): Promise<DocumentTemplate> {
    const template = await this.documentTemplateRepository.findOne({
      where: { documentTemplateId },
    });

    if (!template) {
      throw new DocumentTemplateNotFoundException(documentTemplateId);
    }

    return template;
  }
}
