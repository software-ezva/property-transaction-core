import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Workflow } from './workflow.entity';
import { Item } from './item.entity';

@Entity('checklists')
export class Checklist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Workflow, (workflow) => workflow.checklists)
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;

  @OneToMany(() => Item, (item) => item.checklist, { cascade: true })
  items: Item[];

  // Métodos de utilidad
  getItemsNames(): string[] {
    return this.items ? this.items.map((item) => item.description) : [];
  }
}
