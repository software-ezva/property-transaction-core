import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { WorkflowTemplate } from './entities/workflow-template.entity';
import { ChecklistTemplate } from './entities/checklist-template.entity';
import { ItemTemplate } from './entities/item-template.entity';
import { Workflow } from '../transactions/entities/workflow.entity';
import { Checklist } from '../transactions/entities/checklist.entity';
import { Item } from '../transactions/entities/item.entity';

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
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
