import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Checklist } from './checklist.entity';
import { ItemStatus } from '../../common/enums';
import { ItemUpdate } from './item-update.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'date',
    nullable: true,
  })
  expectClosingDate?: Date | null;

  // Relaciones
  @ManyToOne(() => Checklist, (checklist) => checklist.items)
  @JoinColumn({ name: 'checklistId' })
  checklist: Checklist;

  @OneToMany(() => ItemUpdate, (update) => update.item)
  updates: ItemUpdate[];

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
