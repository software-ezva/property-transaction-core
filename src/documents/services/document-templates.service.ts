import { Injectable, Logger } from '@nestjs/common';
import { DocumentTemplate } from '../entities/document-template.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentCategory } from 'src/common/enums';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class DocumentTemplateService {
  private readonly logger = new Logger(DocumentTemplateService.name);
  constructor(
    @InjectRepository(DocumentTemplate)
    private documentTemplateRepository: Repository<DocumentTemplate>,
    private readonly userService: UsersService,
  ) {}

  remove(id: number) {
    return `This action removes a #${id} document`;
  }

  async uploadTemplateDocument(
    userId: string,
    templateName: string,
    url: string,
    category: DocumentCategory,
  ) {
    await this.userService.verifyUserIsRealEstateAgent(userId);
    const newTemplate = this.documentTemplateRepository.create({
      category: category,
      url,
      title: templateName,
    });
    return this.documentTemplateRepository.save(newTemplate);
  }
}
