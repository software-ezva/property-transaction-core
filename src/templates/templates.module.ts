import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesService } from './services/templates.service';
import { TemplatesController } from './templates.controller';
import { WorkflowTemplate } from './entities/workflow-template.entity';
import { ChecklistTemplate } from './entities/checklist-template.entity';
import { ItemTemplate } from './entities/item-template.entity';
import { Workflow } from '../transactions/entities/workflow.entity';
import { Checklist } from '../transactions/entities/checklist.entity';
import { Item } from '../transactions/entities/item.entity';
import { ItemTemplateService, ChecklistTemplateService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkflowTemplate,
      ChecklistTemplate,
      ItemTemplate,
      Workflow,
      Checklist,
      Item,
    ]),
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService, ItemTemplateService, ChecklistTemplateService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
