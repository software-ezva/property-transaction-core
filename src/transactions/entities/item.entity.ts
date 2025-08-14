import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Checklist } from './checklist.entity';
import { ItemStatus } from '../../common/enums';

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
  expectClosingDate?: Date | null;

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
