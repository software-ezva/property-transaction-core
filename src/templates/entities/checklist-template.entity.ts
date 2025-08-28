import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkflowTemplate } from './workflow-template.entity';
import { ItemTemplate } from './item-template.entity';

@Entity('checklist_templates')
export class ChecklistTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'Name of the checklist template',
  })
  name: string;

  @Column({
    type: 'text',
    comment: 'Description of the checklist template',
  })
  description: string;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Order position for this checklist in the workflow',
  })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(
    () => WorkflowTemplate,
    (workflowTemplate) => workflowTemplate.checklistTemplates,
    { nullable: true },
  )
  @JoinColumn({ name: 'workflowTemplateId' })
  workflowTemplate: WorkflowTemplate;

  @OneToMany(
    () => ItemTemplate,
    (itemTemplate) => itemTemplate.checklistTemplate,
    { cascade: true },
  )
  items: ItemTemplate[];
}
