import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';
import { Workflow } from './workflow.entity';
import { TransactionType } from '../../common/enums';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  transactionId: number;
  @Column({
    type: 'enum',
    enum: TransactionType,
    nullable: true,
  })
  transactionType: TransactionType;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  additionalNotes?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => Property, (property) => property.transactions, {
    nullable: false,
  })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ManyToOne(() => User, (user) => user.agentTransactions, {
    nullable: false,
  })
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @ManyToOne(() => User, (user) => user.clientTransactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'clientId' })
  client?: User;

  @OneToOne(() => Workflow, (workflow) => workflow.transaction, {
    cascade: ['insert', 'update', 'remove'],
    nullable: true,
    onDelete: 'CASCADE',
  })
  workflow: Workflow;
}
