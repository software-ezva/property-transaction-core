import { PartialType } from '@nestjs/swagger';
import { CreateItemTemplateDto } from './create-item-template.dto';

export class UpdateItemTemplateDto extends PartialType(CreateItemTemplateDto) {}
