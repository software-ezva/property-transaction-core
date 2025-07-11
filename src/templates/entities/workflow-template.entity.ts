import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ChecklistTemplate } from './checklist-template.entity';
import { TransactionType } from '../../common/enums';

@Entity('workflow_templates')
export class WorkflowTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
    comment: 'Type of real estate transaction this template applies to',
  })
  transactionType: TransactionType;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'Name of the workflow template',
  })
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Relaciones
  @OneToMany(
    () => ChecklistTemplate,
    (checklistTemplate) => checklistTemplate.workflowTemplate,
    { cascade: true },
  )
  checklistTemplates: ChecklistTemplate[];
}
