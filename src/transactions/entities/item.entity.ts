import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Checklist } from './checklist.entity';

export enum ItemStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({
    type: 'enum',
    enum: ItemStatus,
    default: ItemStatus.NOT_STARTED,
  })
  status: ItemStatus;
  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  createdAt: Date;

  @Column({
    type: 'date',
    default: () => 'CURRENT_DATE',
    nullable: true,
  })
  expectClosingDate?: Date;

  // Relaciones
  @ManyToOne(() => Checklist, (checklist) => checklist.items)
  @JoinColumn({ name: 'checklistId' })
  checklist: Checklist;

  // Métodos de utilidad
  getStatusDisplay(): string {
    const statusDisplayMap: Record<ItemStatus, string> = {
      [ItemStatus.NOT_STARTED]: 'Pending',
      [ItemStatus.IN_PROGRESS]: 'In progress',
      [ItemStatus.COMPLETED]: 'Completed',
    };
    return statusDisplayMap[this.status];
  }
}
