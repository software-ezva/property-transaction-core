import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChecklistTemplate } from './checklist-template.entity';

@Entity('item_templates')
export class ItemTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Description of the item in the checklist template',
  })
  description: string;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Order position for this item in the checklist',
  })
  order: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(
    () => ChecklistTemplate,
    (checklistTemplate) => checklistTemplate.items,
    { nullable: true },
  )
  @JoinColumn({ name: 'checklistTemplateId' })
  checklistTemplate: ChecklistTemplate;
}
