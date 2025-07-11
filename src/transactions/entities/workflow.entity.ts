import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { Checklist } from './checklist.entity';

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Relaciones
  @OneToOne(() => Transaction, (transaction) => transaction.workflow)
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @OneToMany(() => Checklist, (checklist) => checklist.workflow, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  checklists: Checklist[];

  // Métodos de utilidad
  getChecklistsNames(): string[] {
    return this.checklists
      ? this.checklists.map((checklist) => checklist.name)
      : [];
  }
}
